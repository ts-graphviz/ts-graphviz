import { type ChildProcess, spawn } from 'node:child_process';
import { VerdaccioError } from './error-handler.js';
import { logger } from './logger.js';
import type { E2EConfig, VerdaccioInstance } from './types.js';

export class VerdaccioManager implements VerdaccioInstance {
  private process: ChildProcess | null = null;
  private config: E2EConfig;

  constructor(config: E2EConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    if (this.isRunning()) {
      throw new VerdaccioError('Verdaccio is already running');
    }

    logger.debug('Starting Verdaccio registry...');

    // Kill any existing Verdaccio processes on this port
    await this.killExistingProcesses();

    return new Promise((resolve, reject) => {
      // Start Verdaccio with minimal logging
      this.process = spawn(
        'pnpm',
        ['verdaccio', '--config', this.config.verdaccioConfig],
        {
          stdio: ['ignore', 'pipe', 'pipe'],
          detached: false,
          env: {
            ...process.env,
            // Suppress Verdaccio logs
            NODE_ENV: 'production',
          },
        },
      );

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

      // Also try pinging the server periodically
      const healthCheck = async () => {
        if (resolved) return;

        try {
          const response = await fetch(`${this.config.registryUrl}/-/ping`);
          if (response.ok && !resolved) {
            resolved = true;
            clearTimeout(timeout);
            logger.debug('Verdaccio health check passed');
            resolve();
          }
        } catch {
          // Ignore ping errors during startup
        }
      };

      // Start health checking after a brief delay
      setTimeout(() => {
        const interval = setInterval(async () => {
          if (resolved) {
            clearInterval(interval);
            return;
          }
          await healthCheck();
        }, 2000);
      }, 3000);

      // Monitor stdout for startup confirmation
      this.process.stdout?.on('data', (data: Buffer) => {
        const output = data.toString();
        logger.debug('Verdaccio stdout:', output.trim());

        // Verdaccio is ready when it shows the http address or starts listening
        if (
          (output.includes('http address') ||
            output.includes('http://') ||
            output.includes(`${this.config.verdaccioPort}`) ||
            output.includes('listen')) &&
          !resolved
        ) {
          resolved = true;
          clearTimeout(timeout);
          logger.debug('Verdaccio started successfully');
          resolve();
        }
      });

      // Monitor stderr for errors - but don't log everything
      this.process.stderr?.on('data', (data: Buffer) => {
        const error = data.toString().trim();
        // Only log actual errors, not info messages
        if (
          error &&
          (error.includes('error') ||
            error.includes('Error') ||
            error.includes('ERROR'))
        ) {
          logger.error('Verdaccio stderr:', error);
        } else {
          logger.debug('Verdaccio stderr:', error);
        }
      });

      this.process.on('error', (error) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          reject(
            new VerdaccioError(
              `Verdaccio process error: ${error.message}`,
              error,
            ),
          );
        }
      });

      this.process.on('exit', (code) => {
        if (!resolved && code !== 0) {
          resolved = true;
          clearTimeout(timeout);
          reject(new VerdaccioError(`Verdaccio exited with code ${code}`));
        }
      });
    });
  }

  async stop(): Promise<void> {
    if (this.process) {
      logger.debug('Stopping Verdaccio process...');

      // Send SIGTERM first for graceful shutdown
      this.process.kill('SIGTERM');

      // Wait for process to exit
      await new Promise<void>((resolve) => {
        if (!this.process) {
          resolve();
          return;
        }

        const cleanup = () => {
          this.process = null;
          resolve();
        };

        this.process.on('exit', cleanup);

        // Force kill after 5 seconds
        setTimeout(() => {
          if (this.process && !this.process.killed) {
            logger.debug('Force killing Verdaccio process');
            this.process.kill('SIGKILL');
          }
          cleanup();
        }, 5000);
      });
    }

    // Cleanup any remaining processes
    await this.killExistingProcesses();
  }

  isRunning(): boolean {
    return this.process !== null && !this.process.killed;
  }

  getRegistryUrl(): string {
    return this.config.registryUrl;
  }

  private async killExistingProcesses(): Promise<void> {
    try {
      // Try to kill processes by name
      await new Promise<void>((resolve) => {
        const killProcess = spawn('pkill', ['-f', 'verdaccio'], {
          stdio: 'ignore',
        });
        killProcess.on('exit', () => resolve());
        killProcess.on('error', () => resolve()); // Ignore errors if no process found
      });

      // Also try to kill by port
      await new Promise<void>((resolve) => {
        const killProcess = spawn(
          'bash',
          [
            '-c',
            `lsof -ti:${this.config.verdaccioPort} | xargs kill -9 2>/dev/null || true`,
          ],
          { stdio: 'ignore' },
        );
        killProcess.on('exit', () => resolve());
        killProcess.on('error', () => resolve());
      });

      // Wait a bit for cleanup
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch {
      // Ignore errors - processes might not exist
    }
  }

  async waitForReady(): Promise<void> {
    const maxAttempts = 30;
    let attempts = 0;

    logger.debug('Waiting for Verdaccio to be ready...');

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`${this.config.registryUrl}/-/ping`);
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
