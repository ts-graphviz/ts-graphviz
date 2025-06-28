import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { logger } from './logger.js';

export class NpmConfigManager {
  private backupPath: string;
  private originalPath: string;

  constructor() {
    this.originalPath = resolve(homedir(), '.npmrc');
    this.backupPath = resolve(homedir(), '.npmrc.backup');
  }

  async backup(): Promise<void> {
    try {
      await copyFile(this.originalPath, this.backupPath);
      logger.debug('Npm config backed up');
    } catch {
      // Original .npmrc might not exist
      logger.debug('No existing .npmrc to backup');
    }
  }

  async setRegistry(registryUrl: string): Promise<void> {
    const content = `registry=${registryUrl}\n`;
    await writeFile(this.originalPath, content);
    logger.debug(`Npm registry set to: ${registryUrl}`);
  }

  async restore(): Promise<void> {
    try {
      await copyFile(this.backupPath, this.originalPath);
      // Clean up backup
      await this.cleanup();
    } catch {
      // If backup doesn't exist, remove the temporary .npmrc
      try {
        const content = await readFile(this.originalPath, 'utf8');
        if (content.includes('http://localhost:')) {
          // This looks like our temporary registry config
          await this.cleanup();
        }
      } catch {
        // Ignore errors
      }
    }
  }

  private async cleanup(): Promise<void> {
    try {
      const { unlink } = await import('node:fs/promises');
      await unlink(this.backupPath);
    } catch {
      // Ignore errors
    }
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
