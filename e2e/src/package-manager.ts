import { readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execa } from 'execa';
import { PackagePublishError } from './error-handler.js';
import { logger } from './logger.js';
import { PackageDiscovery } from './package-discovery.js';
import type { E2ERunnerConfig } from './types.js';
import type { NpmConfigManager } from './utils.js';

export class PackageManager {
  private config: E2ERunnerConfig;
  private registryUrl: string | null = null;
  private npmrcManager: any | null = null;
  private packageDiscovery: PackageDiscovery;

  constructor(config: E2ERunnerConfig) {
    this.config = config;
    // Set package discovery to use project root directory
    const projectRoot = resolve(
      dirname(fileURLToPath(import.meta.url)),
      '../..',
    );
    this.packageDiscovery = new PackageDiscovery(projectRoot);
  }

  setNpmrcManager(npmrcManager: NpmConfigManager): void {
    this.npmrcManager = npmrcManager;
  }

  async publishPackages(): Promise<void> {
    // Discover packages to publish
    const discoveredPackages = await this.packageDiscovery.discoverPackages(
      this.config.packages.discovery,
    );

    if (discoveredPackages.length === 0) {
      throw new Error('No publishable packages found');
    }

    logger.info(
      `Publishing ${discoveredPackages.length} packages: ${discoveredPackages.map((p) => p.name).join(', ')}`,
    );

    // Create workspace package names set for dependency updates
    const workspacePackageNames = new Set(
      discoveredPackages.map((pkg) => pkg.name),
    );

    // Create backup of original package.json files
    const backups = new Map<string, string>();

    try {
      // Update versions in all packages
      for (const pkg of discoveredPackages) {
        const packageJsonPath = resolve(pkg.path, 'package.json');
        const originalContent = await readFile(packageJsonPath, 'utf8');
        backups.set(packageJsonPath, originalContent);

        await this.updatePackageJson(packageJsonPath, workspacePackageNames);
      }

      // Publish all packages using pnpm
      for (const pkg of discoveredPackages) {
        await this.publishSinglePackage(pkg.path);
      }
    } finally {
      // Restore original package.json files
      for (const [packageJsonPath, originalContent] of backups) {
        try {
          await writeFile(packageJsonPath, originalContent);
        } catch (error) {
          logger.error(`Failed to restore ${packageJsonPath}:`, error);
        }
      }
    }
  }

  private async publishSinglePackage(packageDir: string): Promise<void> {
    const packageName = basename(packageDir);
    if (this.registryUrl === null) {
      throw new Error(
        'Registry URL is not set. Please call setupNpmRegistry first.',
      );
    }

    try {
      const publishArgs = [
        'publish',
        '--registry',
        this.registryUrl,
        '--tag',
        'e2e-test',
        '--access',
        'public',
        '--no-git-checks',
      ];

      const publishEnv: NodeJS.ProcessEnv = {
        ...process.env,
        // Ensure pnpm uses the correct registry
        NPM_CONFIG_REGISTRY: this.registryUrl,
        // Disable git checks via environment variables
        NPM_CONFIG_GIT_TAG_VERSION: 'false',
        NPM_CONFIG_COMMIT_HOOKS: 'false',
        NPM_CONFIG_FUND: 'false',
        // PNPM specific git check disable
        PNPM_CONFIG_GIT_CHECKS: 'false',
      };

      // Use temporary npmrc via environment variable if available
      if (this.npmrcManager?.getTempNpmrcPath) {
        publishEnv.NPM_CONFIG_USERCONFIG = this.npmrcManager.getTempNpmrcPath();
      }

      // Use pnpm publish to handle workspace dependencies properly
      await execa('pnpm', publishArgs, {
        cwd: packageDir,
        stdio: 'pipe',
        env: publishEnv,
      });
      logger.success(`Published ${packageName}`);
    } catch (error) {
      const execaError = error as any;
      let errorDetails = '';

      if (execaError.stdout) {
        errorDetails += `\nStdout: ${execaError.stdout}`;
      }
      if (execaError.stderr) {
        errorDetails += `\nStderr: ${execaError.stderr}`;
      }
      if (execaError.message) {
        errorDetails += `\nMessage: ${execaError.message}`;
      }

      const publishError = new PackagePublishError(
        `Failed to publish ${packageName}${errorDetails}`,
        packageName,
        error as Error,
      );
      logger.error(publishError.message);
      throw publishError;
    }
  }

  private async updatePackageJson(
    packageJsonPath: string,
    workspacePackageNames: Set<string>,
  ): Promise<void> {
    const content = await readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(content);

    // Update version
    packageJson.version = this.config.packages.testVersion;

    // Convert workspace: dependencies to actual test versions
    await this.updateWorkspaceDependencies(
      packageJson,
      'dependencies',
      workspacePackageNames,
    );
    await this.updateWorkspaceDependencies(
      packageJson,
      'devDependencies',
      workspacePackageNames,
    );
    await this.updateWorkspaceDependencies(
      packageJson,
      'peerDependencies',
      workspacePackageNames,
    );

    // Remove provenance from publishConfig to avoid npm registry issues in test environment
    if (packageJson.publishConfig?.provenance) {
      delete packageJson.publishConfig.provenance;
    }

    await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }

  private async updateWorkspaceDependencies(
    packageJson: any,
    depType: string,
    workspacePackageNames: Set<string>,
  ): Promise<void> {
    if (!packageJson[depType]) return;

    for (const [depName, depVersion] of Object.entries(packageJson[depType])) {
      if (
        typeof depVersion === 'string' &&
        depVersion.startsWith('workspace:')
      ) {
        // Convert workspace dependencies to test versions if they are known workspace packages
        if (workspacePackageNames.has(depName)) {
          packageJson[depType][depName] = this.config.packages.testVersion;
        }
      }
    }
  }

  async setupNpmRegistry(
    registryUrl: string,
    secureCredentials: { username: string; password: string; email: string },
  ): Promise<void> {
    this.registryUrl = registryUrl; // Store for later use

    try {
      // Use secure credentials if provided, fallback to config (though config should be empty for security)
      const auth = secureCredentials;

      await this.npmLogin({
        ...auth,
        registry: registryUrl,
      });

      // Verify authentication works
      try {
        const whoamiArgs = ['whoami', '--registry', registryUrl];

        const whoamiEnv: NodeJS.ProcessEnv = {
          ...process.env,
          NPM_CONFIG_REGISTRY: registryUrl,
        };

        // Use temporary npmrc via environment variable if available
        if (this.npmrcManager?.getTempNpmrcPath) {
          whoamiEnv.NPM_CONFIG_USERCONFIG =
            this.npmrcManager.getTempNpmrcPath();

          // Debug: Check if .npmrc file exists and has content
          try {
            const npmrcContent = await readFile(
              this.npmrcManager.getTempNpmrcPath(),
              'utf8',
            );
            logger.debug(
              `Temp .npmrc content for verification: ${npmrcContent.trim()}`,
            );
          } catch (e) {
            logger.debug('Failed to read temp .npmrc for verification:', e);
          }
        }

        const result = await execa('npm', whoamiArgs, {
          stdio: 'pipe',
          env: whoamiEnv,
        });
        logger.debug(`npm whoami result: ${result.stdout}`);
      } catch {
        // Don't fail setup if whoami fails - authentication token was successfully obtained
        logger.debug(
          'npm whoami verification failed (but authentication token obtained successfully)',
        );
        // Skip the detailed error since it clutters the output and doesn't indicate real failure
      }
    } catch (error) {
      logger.error('Registry setup failed:', error);
      throw error;
    }
  }

  private async npmLogin(credentials: {
    username: string;
    password: string;
    email: string;
    registry: string;
  }): Promise<void> {
    const { username, password, registry } = credentials;

    logger.debug(
      `Attempting npm login to ${registry} with username: ${username}`,
    );

    try {
      // For verdaccio-auth-memory, create basic auth token directly
      // The auth-memory plugin uses simple username:password authentication
      logger.debug('Creating basic auth token for verdaccio-auth-memory');

      // Write basic auth configuration to npmrc
      await this.writeBasicAuth(registry, username, password);

      logger.debug('Basic auth configuration written to npmrc');
    } catch (error) {
      const execaError = error as any;
      let errorDetails = '';

      if (execaError.stdout) {
        errorDetails += `\nStdout: ${execaError.stdout}`;
      }
      if (execaError.stderr) {
        errorDetails += `\nStderr: ${execaError.stderr}`;
      }

      throw new Error(
        `Failed to authenticate with npm registry: ${execaError.message || String(error)}${errorDetails}`,
      );
    }
  }

  private async writeBasicAuth(
    registryUrl: string,
    username: string,
    password: string,
  ): Promise<void> {
    if (!this.npmrcManager?.getTempNpmrcPath) {
      throw new Error('npmrcManager not configured');
    }

    const registryHost = new URL(registryUrl);
    const hostWithPort = registryHost.port
      ? `${registryHost.hostname}:${registryHost.port}`
      : registryHost.hostname;

    // Create base64 encoded auth string
    const authString = Buffer.from(`${username}:${password}`).toString(
      'base64',
    );

    // Only include the minimum required settings for npm authentication
    // registry= is not needed since we pass --registry in CLI
    const npmrcContent = `//${hostWithPort}/:_auth=${authString}\n`;

    await writeFile(this.npmrcManager.getTempNpmrcPath(), npmrcContent);
    logger.debug(
      `Basic auth written to temporary .npmrc: ${this.npmrcManager.getTempNpmrcPath()}`,
    );
  }
}
