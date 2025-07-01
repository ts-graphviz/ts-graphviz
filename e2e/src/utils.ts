import { unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { logger } from './logger.js';

export class NpmConfigManager implements AsyncDisposable {
  private tempNpmrcPath: string;
  private registryUrl: string | null = null;

  constructor(workingDir: string = process.cwd()) {
    // Create temporary .npmrc in working directory (not global)
    this.tempNpmrcPath = resolve(workingDir, '.npmrc.e2e-temp');
  }

  async [Symbol.asyncDispose](): Promise<void> {
    // Clean up temporary .npmrc file
    try {
      await unlink(this.tempNpmrcPath);
      logger.debug('Temporary .npmrc file removed');
    } catch {
      // File might not exist, ignore error
    }
  }

  async backup(): Promise<void> {
    // No global backup needed
    logger.debug('Using project-local .npmrc (no global backup needed)');
  }

  async setRegistry(registryUrl: string): Promise<void> {
    this.registryUrl = registryUrl;
    logger.debug(`Registry URL stored: ${registryUrl}`);
  }

  getTempNpmrcPath(): string {
    return this.tempNpmrcPath;
  }

  getRegistryUrl(): string | null {
    return this.registryUrl;
  }
}

export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  const seconds = Math.floor(ms / 1000);
  const remainingMs = ms % 1000;

  if (seconds < 60) {
    return `${seconds}.${Math.floor(remainingMs / 100)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
}

export function createProgressLogger(total: number) {
  let completed = 0;

  return {
    increment() {
      completed++;
      console.log(
        `Progress: ${completed}/${total} (${Math.round((completed / total) * 100)}%)`,
      );
    },

    complete() {
      console.log(`✅ All ${total} tasks completed`);
    },
  };
}
