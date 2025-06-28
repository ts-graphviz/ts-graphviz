import {
  copyFile,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execa } from 'execa';
import { PackagePublishError } from './error-handler.js';
import { logger } from './logger.js';
import type { E2EConfig } from './types.js';

export class PackageManager {
  private config: E2EConfig;

  constructor(config: E2EConfig) {
    this.config = config;
  }

  async publishPackages(): Promise<void> {
    // Create temporary directory for modified packages
    const tempDir = await mkdtemp(join(tmpdir(), 'ts-graphviz-e2e-'));

    try {
      // Get all workspace packages
      const packageDirs = await this.getWorkspacePackages();

      // Process each package
      for (const packageDir of packageDirs) {
        await this.processPackage(packageDir, tempDir);
      }

      // Publish all packages from temp directory
      await this.publishFromTempDir(tempDir);
    } finally {
      // Cleanup temp directory
      await this.cleanupTempDir(tempDir);
    }
  }

  private async getWorkspacePackages(): Promise<string[]> {
    const packagesDir = this.config.packagesDir;
    const entries = await readdir(packagesDir, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => resolve(packagesDir, entry.name))
      .filter(async (dir) => {
        try {
          const packageJsonPath = resolve(dir, 'package.json');
          await readFile(packageJsonPath);
          return true;
        } catch {
          return false;
        }
      });
  }

  private async processPackage(
    packageDir: string,
    tempDir: string,
  ): Promise<void> {
    const packageName = packageDir.split('/').pop()!;
    const tempPackageDir = resolve(tempDir, packageName);

    // Create temp package directory
    await mkdir(tempPackageDir, { recursive: true });

    // Copy package.json
    const originalPackageJson = resolve(packageDir, 'package.json');
    const tempPackageJson = resolve(tempPackageDir, 'package.json');
    await copyFile(originalPackageJson, tempPackageJson);

    // Copy lib directory if it exists
    const libDir = resolve(packageDir, 'lib');
    const tempLibDir = resolve(tempPackageDir, 'lib');

    try {
      await this.copyDirectory(libDir, tempLibDir);
    } catch {
      // lib directory might not exist
    }

    // Copy other necessary files
    const filesToCopy = ['README.md', 'CHANGELOG.md', 'tsconfig.json'];
    for (const file of filesToCopy) {
      try {
        await copyFile(
          resolve(packageDir, file),
          resolve(tempPackageDir, file),
        );
      } catch {
        // File might not exist
      }
    }

    // Copy media directory if it exists
    try {
      const mediaDir = resolve(packageDir, 'media');
      const tempMediaDir = resolve(tempPackageDir, 'media');
      await this.copyDirectory(mediaDir, tempMediaDir);
    } catch {
      // media directory might not exist
    }

    // Update package.json
    await this.updatePackageJson(tempPackageJson);
  }

  private async copyDirectory(src: string, dest: string): Promise<void> {
    await mkdir(dest, { recursive: true });
    const entries = await readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = resolve(src, entry.name);
      const destPath = resolve(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await copyFile(srcPath, destPath);
      }
    }
  }

  private async updatePackageJson(packageJsonPath: string): Promise<void> {
    const content = await readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(content);

    // Update version
    packageJson.version = this.config.testVersion;

    // Remove provenance from publishConfig
    if (packageJson.publishConfig?.provenance) {
      delete packageJson.publishConfig.provenance;
    }

    // Update workspace dependencies to use test version
    const dependencyFields = ['dependencies', 'peerDependencies'];

    for (const field of dependencyFields) {
      if (packageJson[field]) {
        for (const [name, version] of Object.entries(packageJson[field])) {
          if (
            typeof version === 'string' &&
            (version.startsWith('workspace:') ||
              name.startsWith('@ts-graphviz/'))
          ) {
            packageJson[field][name] = this.config.testVersion;
          }
        }
      }
    }

    // Apply publishConfig to root level
    if (packageJson.publishConfig) {
      Object.assign(packageJson, packageJson.publishConfig);
      delete packageJson.publishConfig;
    }

    await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }

  private async publishFromTempDir(tempDir: string): Promise<void> {
    const packages = await readdir(tempDir);

    for (const packageName of packages) {
      const packageDir = resolve(tempDir, packageName);

      try {
        await execa(
          'npm',
          ['publish', '--registry', this.config.registryUrl, '--no-git-checks'],
          {
            cwd: packageDir,
            stdio: 'pipe',
          },
        );
        logger.success(`Published ${packageName}`);
      } catch (error) {
        const publishError = new PackagePublishError(
          `Failed to publish ${packageName}`,
          packageName,
          error as Error,
        );
        logger.error(publishError.message);
        throw publishError;
      }
    }
  }

  private async cleanupTempDir(tempDir: string): Promise<void> {
    try {
      await execa('rm', ['-rf', tempDir]);
    } catch {
      // Ignore cleanup errors
    }
  }

  async setupNpmRegistry(): Promise<void> {
    // Login to npm registry
    await execa('pnpm', [
      'exec',
      'npm-cli-login',
      '-u',
      'test',
      '-p',
      'test',
      '-e',
      'test@example.com',
      '-r',
      this.config.registryUrl,
    ]);
  }
}
