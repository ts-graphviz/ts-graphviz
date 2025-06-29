import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { findWorkspacePackages } from '@pnpm/workspace.find-packages';
import { execa } from 'execa';
import { glob } from 'glob';
import { logger } from './logger.js';
import type { PackageDiscoveryConfig } from './types.js';

export interface DiscoveredPackage {
  name: string;
  path: string;
  private: boolean;
  publishConfig?: {
    access?: string;
    registry?: string;
  };
}

export class PackageDiscovery {
  private rootDir: string;

  constructor(rootDir: string = process.cwd()) {
    this.rootDir = rootDir;
  }

  /**
   * Discover packages to publish based on configuration
   */
  async discoverPackages(
    config?: PackageDiscoveryConfig,
  ): Promise<DiscoveredPackage[]> {
    const packages: DiscoveredPackage[] = [];

    // Try workspace discovery first (if enabled)
    if (config?.workspace?.enabled !== false) {
      try {
        const workspacePackages = await this.discoverWorkspacePackages();
        packages.push(...workspacePackages);
        logger.debug(
          `Discovered ${workspacePackages.length} packages from pnpm workspace`,
        );
      } catch (error) {
        logger.debug('Workspace discovery failed:', error);
      }
    }

    // Add manual packages if specified
    if (config?.manual?.packages) {
      const manualPackages = await this.discoverManualPackages(
        config.manual.packages,
      );
      packages.push(...manualPackages);
      logger.debug(
        `Added ${manualPackages.length} packages from manual configuration`,
      );
    }

    // Filter packages based on configuration
    let filteredPackages = packages;

    // Apply workspace include/exclude patterns
    if (config?.workspace?.include || config?.workspace?.exclude) {
      filteredPackages = this.filterPackagesByPatterns(
        filteredPackages,
        config.workspace.include,
        config.workspace.exclude,
      );
    }

    // Remove private packages unless explicitly configured
    filteredPackages = filteredPackages.filter((pkg) => !pkg.private);

    return this.deduplicatePackages(filteredPackages);
  }

  /**
   * Discover packages from pnpm workspace using official pnpm API
   */
  private async discoverWorkspacePackages(): Promise<DiscoveredPackage[]> {
    try {
      // Use official pnpm workspace package discovery
      const workspacePackages = await findWorkspacePackages(this.rootDir);
      logger.debug(
        `findWorkspacePackages returned ${workspacePackages.length} packages`,
      );
      workspacePackages.forEach((pkg, index) => {
        logger.debug(
          `Package ${index}: name=${pkg.manifest?.name}, rootDir=${pkg.rootDir}, keys=${Object.keys(pkg).join(',')}`,
        );
      });

      const packages: DiscoveredPackage[] = [];

      for (const pkg of workspacePackages) {
        try {
          // The package object contains rootDir and manifest
          // For workspace packages, rootDir is the package directory
          const packageDir = pkg.rootDir;
          if (!packageDir) {
            logger.debug(
              'Package directory not found in workspace package:',
              pkg,
            );
            continue;
          }

          // Create DiscoveredPackage from the workspace package info
          const discoveredPkg: DiscoveredPackage = {
            name: pkg.manifest.name,
            path: packageDir,
            private: pkg.manifest.private === true,
            publishConfig: pkg.manifest.publishConfig,
          };

          if (discoveredPkg.name) {
            packages.push(discoveredPkg);
          }
        } catch (error) {
          logger.debug(`Failed to process workspace package:`, error);
        }
      }

      return packages;
    } catch (error) {
      throw new Error(
        `Failed to discover workspace packages: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Discover packages from manual configuration
   */
  private async discoverManualPackages(
    patterns: string[],
  ): Promise<DiscoveredPackage[]> {
    const packages: DiscoveredPackage[] = [];

    for (const pattern of patterns) {
      // Check if pattern is a direct path to a package
      const directPath = resolve(this.rootDir, pattern);
      try {
        const pkg = await this.loadPackageInfo(directPath);
        if (pkg) {
          packages.push(pkg);
          continue;
        }
      } catch {
        // Not a direct package path, try as glob pattern
      }

      // Try as glob pattern
      try {
        const matchedDirs = await glob(pattern, {
          cwd: this.rootDir,
        });

        // Filter to only directories
        const directories = [];
        for (const dir of matchedDirs) {
          try {
            const fullPath = resolve(this.rootDir, dir);
            const stats = await stat(fullPath);
            if (stats.isDirectory()) {
              directories.push(dir);
            }
          } catch {
            // Skip if stat fails
          }
        }

        for (const dir of directories) {
          const packagePath = resolve(this.rootDir, dir);
          try {
            const pkg = await this.loadPackageInfo(packagePath);
            if (pkg) {
              packages.push(pkg);
            }
          } catch (error) {
            logger.debug(`Failed to load package info for ${dir}:`, error);
          }
        }
      } catch (error) {
        logger.debug(`Failed to process pattern ${pattern}:`, error);
      }
    }

    return packages;
  }

  /**
   * Load package information from a directory
   */
  private async loadPackageInfo(
    packagePath: string,
  ): Promise<DiscoveredPackage | null> {
    const packageJsonPath = resolve(packagePath, 'package.json');

    try {
      const packageJsonContent = await readFile(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageJsonContent);

      if (!packageJson.name) {
        logger.debug(`Package at ${packagePath} has no name, skipping`);
        return null;
      }

      return {
        name: packageJson.name,
        path: packagePath,
        private: packageJson.private === true,
        publishConfig: packageJson.publishConfig,
      };
    } catch (error) {
      logger.debug(`Failed to read package.json at ${packagePath}:`, error);
      return null;
    }
  }

  /**
   * Filter packages by include/exclude patterns
   */
  private filterPackagesByPatterns(
    packages: DiscoveredPackage[],
    include?: string[],
    exclude?: string[],
  ): DiscoveredPackage[] {
    let filtered = packages;

    // Apply include patterns
    if (include && include.length > 0) {
      filtered = filtered.filter((pkg) =>
        include.some((pattern) => this.matchesPattern(pkg.name, pattern)),
      );
    }

    // Apply exclude patterns
    if (exclude && exclude.length > 0) {
      filtered = filtered.filter(
        (pkg) =>
          !exclude.some((pattern) => this.matchesPattern(pkg.name, pattern)),
      );
    }

    return filtered;
  }

  /**
   * Check if a package name matches a pattern
   */
  private matchesPattern(name: string, pattern: string): boolean {
    // Convert simple wildcard patterns to regex
    const regexPattern = pattern.replace(/\*/g, '.*').replace(/\?/g, '.');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(name);
  }

  /**
   * Remove duplicate packages (by name)
   */
  private deduplicatePackages(
    packages: DiscoveredPackage[],
  ): DiscoveredPackage[] {
    const seen = new Map<string, DiscoveredPackage>();

    for (const pkg of packages) {
      if (!seen.has(pkg.name)) {
        seen.set(pkg.name, pkg);
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Get publishable package list using pnpm list command (alternative method)
   */
  async getPublishablePackagesViaPnpm(): Promise<DiscoveredPackage[]> {
    try {
      const result = await execa('pnpm', ['list', '--json', '--depth=0'], {
        cwd: this.rootDir,
        stdio: 'pipe',
      });

      const pnpmOutput = JSON.parse(result.stdout);
      const packages: DiscoveredPackage[] = [];

      // Handle both single package and workspace responses
      const packageList = Array.isArray(pnpmOutput) ? pnpmOutput : [pnpmOutput];

      for (const item of packageList) {
        if (item.name && item.path && !item.private) {
          packages.push({
            name: item.name,
            path: item.path,
            private: item.private === true,
            publishConfig: item.publishConfig,
          });
        }
      }

      return packages;
    } catch (error) {
      logger.debug('Failed to get packages via pnpm list:', error);
      return [];
    }
  }
}
