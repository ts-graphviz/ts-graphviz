import { randomBytes, randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer, type Server } from 'node:http';
import { devNull, tmpdir } from 'node:os';
import { join } from 'node:path';
import { runServer } from 'verdaccio';
import { VerdaccioError } from './error-handler.js';
import { logger } from './logger.js';
import type { E2ERunnerConfig, VerdaccioInstance } from './types.js';

export class VerdaccioManager implements VerdaccioInstance, AsyncDisposable {
  private config: E2ERunnerConfig;
  private server: Server | null = null;
  private actualPort: number | null = null;
  private tempDir: string | null = null;
  private secureUsername: string;
  private securePassword: string;

  constructor(config: E2ERunnerConfig) {
    this.config = config;
    // Generate secure random credentials for this session
    this.secureUsername = `e2e-${randomUUID()}`;
    this.securePassword = randomBytes(32).toString('hex');
  }

  async [Symbol.asyncDispose](): Promise<void> {
    // Async cleanup for using statement
    logger.debug('VerdaccioManager: Running async dispose cleanup');
    await this.stop();
  }

  async start(): Promise<void> {
    if (this.isRunning()) {
      throw new VerdaccioError('Verdaccio is already running');
    }

    logger.debug('Starting Verdaccio registry...');

    // Find an available port starting from the default port
    const defaultPort = this.config.registry.port || 4873;
    this.actualPort = await this.findAvailablePort(defaultPort);

    // Create temporary directory for Verdaccio storage
    this.tempDir = await mkdtemp(join(tmpdir(), 'verdaccio-e2e-'));

    try {
      // Create in-memory Verdaccio configuration
      const verdaccioConfig = this.createInMemoryConfig();
      logger.debug(
        `Starting Verdaccio on port ${this.actualPort} with temp storage: ${this.tempDir}`,
      );

      // Use Verdaccio Node.js API with in-memory config
      const app = await runServer(verdaccioConfig);

      return new Promise((resolve, reject) => {
        let resolved = false;

        // Set up timeout
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            this.stop();
            reject(
              new VerdaccioError('Verdaccio failed to start within 30 seconds'),
            );
          }
        }, 30000);

        // Start the HTTP server on the available port
        this.server = app.listen(this.actualPort, (error?: Error) => {
          if (error) {
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              reject(
                new VerdaccioError(
                  `Failed to start Verdaccio server: ${error.message}`,
                  error,
                ),
              );
            }
            return;
          }

          logger.debug(`Verdaccio started on port ${this.actualPort}`);

          // Wait a moment for the server to be fully ready
          setTimeout(async () => {
            if (resolved) return;

            // Health check to ensure the server is responding
            try {
              const registryUrl = `http://localhost:${this.actualPort}`;
              const response = await fetch(`${registryUrl}/-/ping`);
              if (response.ok && !resolved) {
                resolved = true;
                clearTimeout(timeout);
                logger.debug('Verdaccio health check passed');
                resolve();
              }
            } catch (healthError) {
              // If health check fails, still consider it started if the server is listening
              if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                logger.debug(
                  'Verdaccio started (health check failed but server is listening)',
                );
                resolve();
              }
            }
          }, 1000);
        });

        // Handle server errors
        this.server?.on('error', (error: Error) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            reject(
              new VerdaccioError(
                `Verdaccio server error: ${error.message}`,
                error,
              ),
            );
          }
        });
      });
    } catch (error) {
      throw new VerdaccioError(
        `Failed to initialize Verdaccio: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  async stop(): Promise<void> {
    if (this.server) {
      logger.debug('Stopping Verdaccio server...');

      await new Promise<void>((resolve) => {
        const cleanup = () => {
          this.server = null;
          resolve();
        };

        // Set a timeout for graceful shutdown
        const timeout = setTimeout(() => {
          logger.debug('Force closing Verdaccio server');
          this.server?.close();
          cleanup();
        }, 5000);

        this.server?.close((error) => {
          clearTimeout(timeout);
          if (error) {
            logger.debug(`Error closing Verdaccio server: ${error.message}`);
          } else {
            logger.debug('Verdaccio server stopped gracefully');
          }
          cleanup();
        });
      });
    }

    // Cleanup temporary directory
    if (this.tempDir) {
      try {
        logger.debug(`Cleaning up temporary directory: ${this.tempDir}`);
        await rm(this.tempDir, { recursive: true, force: true });
        logger.debug('Temporary directory cleaned up successfully');
        this.tempDir = null;
      } catch (error) {
        logger.debug(
          `Failed to cleanup temporary directory: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  isRunning(): boolean {
    return this.server !== null && this.server.listening;
  }

  getRegistryUrl(): string {
    if (this.actualPort === null) {
      throw new VerdaccioError('Verdaccio server not started yet');
    }
    return `http://localhost:${this.actualPort}`;
  }

  private async findAvailablePort(startPort: number): Promise<number> {
    let port = startPort;
    const maxAttempts = 10;

    for (let attempts = 0; attempts < maxAttempts; attempts++) {
      if (!(await this.isPortInUse(port))) {
        logger.debug(`Found available port: ${port}`);
        return port;
      }
      logger.debug(`Port ${port} is in use, trying ${port + 1}`);
      port++;
    }

    throw new VerdaccioError(
      `Could not find available port after ${maxAttempts} attempts starting from ${startPort}`,
    );
  }

  private async isPortInUse(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = createServer();

      server.listen(port, () => {
        server.close(() => {
          resolve(false); // Port is available
        });
      });

      server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          resolve(true); // Port is in use
        } else {
          resolve(false); // Other error, assume available
        }
      });
    });
  }

  private createInMemoryConfig(): any {
    if (!this.tempDir) {
      throw new VerdaccioError('Temporary directory not created');
    }

    return {
      self_path: this.tempDir,
      storage: join(this.tempDir, 'storage'),

      // Authentication configuration
      auth: {
        'auth-memory': {
          users: {
            [this.secureUsername]: {
              name: this.secureUsername,
              // WARNING: verdaccio-auth-memory stores passwords in PLAIN TEXT
              // This is only suitable for testing/development environments
              // For production, use verdaccio-htpasswd which properly hashes passwords
              password: this.securePassword,
            },
          },
        },
      },

      // Secure uplinks configuration
      uplinks: {
        npmjs: {
          url: 'https://registry.npmjs.org/',
          timeout: '10s',
          maxage: '2m',
          fail_timeout: '5m',
          max_fails: 2,
        },
      },

      // Strict package access control
      packages: {
        '@ts-graphviz/*': {
          access: `$authenticated`,
          publish: `$authenticated`,
          unpublish: false,
        },
        'ts-graphviz': {
          access: `$authenticated`,
          publish: `$authenticated`,
          unpublish: false,
        },
        '**': {
          access: `$authenticated`,
          publish: `$authenticated`,
          unpublish: false,
          proxy: 'npmjs',
        },
      },

      // Security settings
      security: {
        api: {
          migrateToSecureLegacySignature: true,
          legacy: false,
        },
        web: {
          enable: false, // Disable web UI for security
        },
      },

      // Disable metrics and audit for E2E testing
      middlewares: {},

      // Secure server configuration
      server: {
        keepAliveTimeout: 60,
        // Bind only to localhost
        host: '127.0.0.1',
      },

      // Silent logging
      log: {
        type: 'rotating-file',
        path: devNull,
        level: 'silent',
      },
      logs: {
        format: 'json',
        level: 'silent',
      },
    };
  }

  /**
   * Get secure credentials for authentication
   */
  getSecureCredentials(): {
    username: string;
    password: string;
    email: string;
  } {
    return {
      username: this.secureUsername,
      password: this.securePassword,
      email: `${this.secureUsername}@e2e-test.local`,
    };
  }

  async waitForReady(): Promise<void> {
    const maxAttempts = 30;
    let attempts = 0;

    logger.debug('Waiting for Verdaccio to be ready...');

    while (attempts < maxAttempts) {
      try {
        const registryUrl = this.getRegistryUrl();
        const response = await fetch(`${registryUrl}/-/ping`);
        if (response.ok) {
          logger.debug('Verdaccio is ready');
          return;
        }
      } catch (error) {
        // Ignore fetch errors during startup
        logger.debug(
          `Verdaccio not ready yet (attempt ${attempts + 1}/${maxAttempts})`,
        );
      }

      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    throw new VerdaccioError(
      'Verdaccio did not become ready within 30 seconds',
    );
  }
}
