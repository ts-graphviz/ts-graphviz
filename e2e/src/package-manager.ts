import { readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execa } from 'execa';
import { PackagePublishError } from './error-handler.js';
import { logger } from './logger.js';
import { PackageDiscovery } from './package-discovery.js';
import type { E2ERunnerConfig } from './types.js';

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

  setNpmrcManager(npmrcManager: any): void {
    this.npmrcManager = npmrcManager;
  }

  private getRegistryUrl(): string {
    const host = this.config.registry.host || 'localhost';
    const port = this.config.registry.port || 4873;
    return `http://${host}:${port}`;
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
    const actualRegistryUrl = this.registryUrl || this.getRegistryUrl();

    try {
      const publishArgs = [
        'publish',
        '--registry',
        actualRegistryUrl,
        '--no-git-checks',
      ];

      const publishEnv: NodeJS.ProcessEnv = {
        ...process.env,
        // Ensure pnpm uses the correct registry
        NPM_CONFIG_REGISTRY: actualRegistryUrl,
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
    registryUrl?: string,
    secureCredentials?: { username: string; password: string; email: string },
  ): Promise<void> {
    const actualRegistryUrl = registryUrl || this.getRegistryUrl();
    this.registryUrl = actualRegistryUrl; // Store for later use

    try {
      // Use secure credentials if provided, fallback to config (though config should be empty for security)
      const auth = secureCredentials ||
        this.config.registry.auth || {
          username: 'fallback-user',
          password: 'fallback-pass',
          email: 'fallback@example.com',
        };

      await this.npmLogin({
        ...auth,
        registry: actualRegistryUrl,
      });

      // Verify authentication works
      try {
        const whoamiArgs = ['whoami', '--registry', actualRegistryUrl];

        const whoamiEnv: NodeJS.ProcessEnv = {
          ...process.env,
          NPM_CONFIG_REGISTRY: actualRegistryUrl,
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
      } catch (error) {
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
    const { username, password, email, registry } = credentials;

    logger.debug(
      `Attempting npm login to ${registry} with username: ${username}`,
    );

    try {
      // Create user object for npm registry
      const userObject = {
        _id: `org.couchdb.user:${username}`,
        name: username,
        password,
        email,
        type: 'user',
        roles: [],
        date: new Date().toISOString(),
      };

      // Prepare authentication header
      const auth = Buffer.from(`${username}:${password}`).toString('base64');
      const apiUrl = `${registry}/-/user/org.couchdb.user:${encodeURIComponent(username)}`;

      logger.debug(`Making fetch request to: ${apiUrl}`);

      // Attempt to create/login user via direct API call
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Accept-Encoding': 'gzip',
          'User-Agent': 'ts-graphviz-e2e/0.0.0',
        },
        body: JSON.stringify(userObject),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Registry authentication failed: ${response.status} ${errorText}`,
        );
      }

      const result = await response.json();
      logger.debug('Authentication response:', JSON.stringify(result, null, 2));

      if (!result.ok || !result.token) {
        throw new Error(
          `Registry authentication failed: No token received. Response: ${JSON.stringify(result)}`,
        );
      }

      // Manually write auth token to the npmrc file
      await this.writeAuthToken(registry, result.token);

      logger.debug(
        `npm registry authentication successful, token: ${result.token.substring(0, 10)}...`,
      );
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

  private async writeAuthToken(
    registryUrl: string,
    token: string,
  ): Promise<void> {
    if (!this.npmrcManager?.getTempNpmrcPath) {
      throw new Error('npmrcManager not configured');
    }

    const registryHost = new URL(registryUrl);
    const hostWithPort = registryHost.port
      ? `${registryHost.hostname}:${registryHost.port}`
      : registryHost.hostname;

    const npmrcContent =
      [
        `registry=${registryUrl}`,
        `//${hostWithPort}/:_authToken=${token}`,
      ].join('\n') + '\n';

    await writeFile(this.npmrcManager.getTempNpmrcPath(), npmrcContent);
    logger.debug(
      `Auth token written to temporary .npmrc: ${this.npmrcManager.getTempNpmrcPath()}`,
    );
  }
}
