import { readFile, rm, stat, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execa } from 'execa';
import pLimit from 'p-limit';

import { logger } from './logger.js';
import type { E2ERunnerConfig, TestPackage, TestResult } from './types.js';
import type { NpmConfigManager } from './utils.js';

/**
 * Manages test package state and cleanup
 */
class TestPackageState implements AsyncDisposable {
  private pkg: TestPackage;
  private originalPackageJson: string | null = null;
  private existingArtifacts: Set<string> = new Set();

  constructor(pkg: TestPackage) {
    this.pkg = pkg;
  }

  async recordExistingArtifacts(): Promise<void> {
    const artifacts = [
      'node_modules',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
    ];

    for (const artifact of artifacts) {
      const artifactPath = resolve(this.pkg.path, artifact);
      try {
        await stat(artifactPath);
        this.existingArtifacts.add(artifact);
      } catch {
        // Artifact doesn't exist
      }
    }
  }

  async backupPackageJson(): Promise<void> {
    const packageJsonPath = resolve(this.pkg.path, 'package.json');
    this.originalPackageJson = await readFile(packageJsonPath, 'utf8');
  }

  async updatePackageJson(testVersion: string): Promise<void> {
    const packageJsonPath = resolve(this.pkg.path, 'package.json');

    if (!this.originalPackageJson) {
      throw new Error(
        'Original package.json not backed up. Call backupPackageJson() first.',
      );
    }

    const packageJson = JSON.parse(this.originalPackageJson);

    // Convert workspace: dependencies to test versions
    let modified = false;
    for (const depType of [
      'dependencies',
      'devDependencies',
      'peerDependencies',
    ]) {
      if (packageJson[depType]) {
        for (const [depName, depVersion] of Object.entries(
          packageJson[depType],
        )) {
          if (
            typeof depVersion === 'string' &&
            depVersion.startsWith('workspace:')
          ) {
            if (
              depName.startsWith('@ts-graphviz/') ||
              depName === 'ts-graphviz'
            ) {
              packageJson[depType][depName] = testVersion;
              modified = true;
            }
          }
        }
      }
    }

    if (modified) {
      await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }
  }

  async [Symbol.asyncDispose](): Promise<void> {
    // Restore package.json
    if (this.originalPackageJson) {
      const packageJsonPath = resolve(this.pkg.path, 'package.json');
      await writeFile(packageJsonPath, this.originalPackageJson);
    }

    // Clean up artifacts that didn't exist before
    const artifactsToClean = [
      { name: 'node_modules', isDir: true },
      { name: 'package-lock.json', isDir: false },
      { name: 'yarn.lock', isDir: false },
      { name: 'pnpm-lock.yaml', isDir: false },
    ];

    for (const artifact of artifactsToClean) {
      if (!this.existingArtifacts.has(artifact.name)) {
        const artifactPath = resolve(this.pkg.path, artifact.name);
        try {
          if (artifact.isDir) {
            await rm(artifactPath, { recursive: true, force: true });
          } else {
            await unlink(artifactPath);
          }
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }
}

export class TestRunner implements AsyncDisposable {
  private config: E2ERunnerConfig;
  private limit = pLimit(4); // Run 4 tests in parallel
  private npmrcManager: NpmConfigManager | null = null;

  constructor(config: E2ERunnerConfig) {
    this.config = config;
  }

  setNpmrcManager(npmrcManager: NpmConfigManager): void {
    this.npmrcManager = npmrcManager;
  }

  private getRegistryUrl(): string {
    const host = this.config.registry.host || 'localhost';
    const port = this.config.registry.port || 4873;
    return `http://${host}:${port}`;
  }

  async [Symbol.asyncDispose](): Promise<void> {
    // Async cleanup for using statement
    logger.debug('TestRunner: Running async dispose cleanup');
    await this.cleanup();
  }

  async runAllTests(testPackages: TestPackage[]): Promise<TestResult[]> {
    logger.info(
      `🧪 Running ${testPackages.length} test packages in parallel...`,
    );

    // Run tests in parallel
    const results = await Promise.all(
      testPackages.map((pkg) => this.limit(() => this.runSingleTest(pkg))),
    );

    return results;
  }

  async runSequentialTests(testPackages: TestPackage[]): Promise<TestResult[]> {
    logger.info(
      `🧪 Running ${testPackages.length} test packages sequentially...`,
    );

    const results: TestResult[] = [];

    for (const pkg of testPackages) {
      const result = await this.runSingleTest(pkg);
      results.push(result);
    }

    return results;
  }

  private async runSingleTest(pkg: TestPackage): Promise<TestResult> {
    const startTime = Date.now();

    await using state = new TestPackageState(pkg);

    try {
      logger.running(`Running ${pkg.name}...`);

      // Record existing artifacts before any modifications
      await state.recordExistingArtifacts();

      // Clean package first
      await this.cleanPackage(pkg);

      // Backup and update package.json for workspace dependencies
      await state.backupPackageJson();

      const testVersion = this.config.packages.testVersion;
      if (!testVersion) {
        throw new Error(
          'Test version not configured. Set config.packages.testVersion.',
        );
      }

      await state.updatePackageJson(testVersion);

      await this.installPackageDependencies(pkg);

      // Run the test with appropriate runtime
      const result = await this.executeTest(pkg);

      const duration = Date.now() - startTime;
      logger.success(`${pkg.name} passed (${duration}ms)`);

      return {
        package: pkg,
        success: true,
        duration,
        output: result.stdout,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`${pkg.name} failed (${duration}ms)`);

      return {
        package: pkg,
        success: false,
        duration,
        error: error as Error,
        output: error instanceof Error ? error.message : String(error),
      };
    }
    // The 'using' statement will automatically call state[Symbol.asyncDispose]()
    // to restore package.json and clean up artifacts
  }

  private async cleanPackage(pkg: TestPackage): Promise<void> {
    try {
      // Remove node_modules and package-lock.json
      const nodeModulesPath = resolve(pkg.path, 'node_modules');
      const packageLockPath = resolve(pkg.path, 'package-lock.json');

      await Promise.allSettled([
        rm(nodeModulesPath, { recursive: true, force: true }),
        rm(packageLockPath, { force: true }),
      ]);
    } catch {
      // Ignore errors if files don't exist
    }
  }

  private async installPackageDependencies(pkg: TestPackage): Promise<void> {
    const runtime = this.detectRuntime(pkg);

    if (runtime === 'deno') {
      // Deno needs to install dependencies for Node.js-style imports
      // Use npm install with registry configuration instead of deno install
      logger.debug(`Installing dependencies for Deno package using npm: ${pkg.name}`);
      const installArgs = ['install', '--registry', this.getRegistryUrl()];
      
      const installEnv: NodeJS.ProcessEnv = {
        ...process.env,
        NPM_CONFIG_REGISTRY: this.getRegistryUrl(),
      };

      // Use temporary npmrc via environment variable if available
      if (this.npmrcManager?.getTempNpmrcPath) {
        installEnv.NPM_CONFIG_USERCONFIG = this.npmrcManager.getTempNpmrcPath();
      }

      await execa('npm', installArgs, {
        cwd: pkg.path,
        stdio: 'pipe',
        env: installEnv,
      });
      return;
    }

    // Install all dependencies from configured registry with npmjs.org as fallback
    const installArgs = ['install', '--registry', this.getRegistryUrl()];

    const installEnv: NodeJS.ProcessEnv = {
      ...process.env,
      NPM_CONFIG_REGISTRY: this.getRegistryUrl(),
    };

    // Use temporary npmrc via environment variable if available
    if (this.npmrcManager?.getTempNpmrcPath) {
      installEnv.NPM_CONFIG_USERCONFIG = this.npmrcManager.getTempNpmrcPath();
    }

    await execa('npm', installArgs, {
      cwd: pkg.path,
      stdio: 'pipe',
      env: installEnv,
    });
  }

  private detectRuntime(pkg: TestPackage): 'node' | 'deno' {
    // Check environment variable first (for CI/CD control)
    if (process.env.E2E_RUNTIME === 'deno') return 'deno';
    if (process.env.E2E_RUNTIME === 'node') return 'node';

    // Check explicit runtime setting
    if (pkg.runtime === 'deno') return 'deno';
    if (pkg.runtime === 'node') return 'node';

    // Auto-detect based on package.json or test command
    if (pkg.testCommand.includes('deno ')) return 'deno';

    // Default to Node.js
    return 'node';
  }

  private async executeTest(pkg: TestPackage): Promise<any> {
    const runtime = this.detectRuntime(pkg);

    if (runtime === 'deno') {
      return await this.executeDenoTest(pkg);
    }
    return await this.executeNodeTest(pkg);
  }

  private async executeNodeTest(pkg: TestPackage): Promise<any> {
    return await execa('npm', ['test'], {
      cwd: pkg.path,
      stdio: 'pipe',
      timeout: 60000, // 60 second timeout
    });
  }

  private async executeDenoTest(pkg: TestPackage): Promise<any> {
    // Parse the test command to extract the script file
    // Expected format: "node script.js" -> "script.js"
    let testScript = 'sample.js'; // default fallback

    if (pkg.testCommand.startsWith('node ')) {
      testScript = pkg.testCommand.replace('node ', '').trim();
    } else if (pkg.testCommand !== 'npm test') {
      testScript = pkg.testCommand;
    }

    // Run Deno with appropriate permissions
    return await execa(
      'deno',
      ['run', '--no-lock', '--allow-run', '--allow-write', testScript],
      {
        cwd: pkg.path,
        stdio: 'pipe',
        timeout: 60000, // 60 second timeout
      },
    );
  }

  async cleanup(): Promise<void> {
    logger.cleanup('Cleaning up test artifacts...');
    // Cleanup is handled per-test in runSingleTest method
  }

  printResults(results: TestResult[]): void {
    logger.info('\n📊 Test Results Summary:');
    logger.info('========================');

    const passed = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    logger.success(`Passed: ${passed.length}`);
    failed.length > 0
      ? logger.error(`Failed: ${failed.length}`)
      : logger.info(`Failed: ${failed.length}`);
    logger.info(
      `⏱️  Total time: ${results.reduce((sum, r) => sum + r.duration, 0)}ms`,
    );

    if (failed.length > 0) {
      logger.error('\nFailed tests:');
      for (const result of failed) {
        logger.error(
          `  - ${result.package.name}: ${result.error?.message || 'Unknown error'}`,
        );
      }
    }

    logger.info('\n🎉 All tests completed!');
  }
}
