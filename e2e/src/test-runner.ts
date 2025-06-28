import { unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execa } from 'execa';
import pLimit from 'p-limit';
import { TestExecutionError } from './error-handler.js';
import { logger } from './logger.js';
import type { E2EConfig, TestPackage, TestResult } from './types.js';

export class TestRunner {
  private config: E2EConfig;
  private limit = pLimit(4); // Run 4 tests in parallel

  constructor(config: E2EConfig) {
    this.config = config;
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

  private async setupExamplesWorkspace(): Promise<void> {
    console.log('🔧 Setting up examples workspace...');

    // Create .npmrc for examples workspace
    const npmrcPath = resolve(this.config.examplesDir, '.npmrc');
    const npmrcContent = `registry=${this.config.registryUrl}\n`;
    await writeFile(npmrcPath, npmrcContent);

    try {
      // Install dependencies for all example packages
      await execa('pnpm', ['install'], {
        cwd: this.config.examplesDir,
        stdio: 'pipe',
      });
      console.log('✅ Examples workspace setup complete');
    } catch (error) {
      console.error('❌ Failed to setup examples workspace:', error);
      throw error;
    }
  }

  private async runSingleTest(pkg: TestPackage): Promise<TestResult> {
    const startTime = Date.now();

    try {
      logger.running(`Running ${pkg.name}...`);

      // Clean and reinstall dependencies for this specific package
      await this.cleanPackage(pkg);
      await this.installPackageDependencies(pkg);

      // Run the test
      const result = await execa('npm', ['test'], {
        cwd: pkg.path,
        stdio: 'pipe',
        timeout: 60000, // 60 second timeout
      });

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
  }

  private async cleanPackage(pkg: TestPackage): Promise<void> {
    try {
      // Remove node_modules and package-lock.json
      await execa('rm', ['-rf', 'node_modules', 'package-lock.json'], {
        cwd: pkg.path,
        stdio: 'pipe',
      });
    } catch {
      // Ignore errors if files don't exist
    }
  }

  private async installPackageDependencies(pkg: TestPackage): Promise<void> {
    if (pkg.type.includes('typescript')) {
      // For TypeScript projects, install system dependencies from npm registry first
      await execa(
        'npm',
        [
          'install',
          '@types/node',
          'tsx',
          'typescript',
          '--registry',
          'https://registry.npmjs.org/',
        ],
        {
          cwd: pkg.path,
          stdio: 'pipe',
        },
      );

      // Then install ts-graphviz from local registry
      await execa(
        'npm',
        ['install', 'ts-graphviz', '--registry', this.config.registryUrl],
        {
          cwd: pkg.path,
          stdio: 'pipe',
        },
      );
    } else {
      // For JavaScript projects, install everything from local registry
      await execa('npm', ['install', '--registry', this.config.registryUrl], {
        cwd: pkg.path,
        stdio: 'pipe',
      });
    }
  }

  async cleanup(): Promise<void> {
    logger.cleanup('Cleaning up test artifacts...');

    // Clean all test packages
    const testPackages = [
      'esm-javascript',
      'cjs-javascript',
      'esm-typescript',
      'cjs-typescript',
    ];

    for (const packageName of testPackages) {
      try {
        const packagePath = resolve(this.config.examplesDir, packageName);
        await execa('rm', ['-rf', 'node_modules', 'package-lock.json'], {
          cwd: packagePath,
          stdio: 'pipe',
        });
      } catch {
        // Ignore errors
      }
    }
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
