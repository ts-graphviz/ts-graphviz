import { access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { E2EConfig, TestPackage } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '../..');

export function createE2EConfig(): E2EConfig {
  const testVersion = `0.0.0-e2e-${Date.now()}`;
  const verdaccioPort = 4873;

  return {
    verdaccioPort,
    verdaccioConfig: resolve(projectRoot, 'etc/verdaccio/config.yaml'),
    testVersion,
    registryUrl: `http://localhost:${verdaccioPort}`,
    packagesDir: resolve(projectRoot, 'packages'),
    examplesDir: resolve(projectRoot, 'examples'),
  };
}

export function getTestPackages(examplesDir: string): TestPackage[] {
  return [
    {
      name: 'ESM JavaScript',
      path: resolve(examplesDir, 'esm-javascript'),
      type: 'esm-javascript',
      testCommand: 'npm test',
    },
    {
      name: 'CommonJS JavaScript',
      path: resolve(examplesDir, 'cjs-javascript'),
      type: 'cjs-javascript',
      testCommand: 'npm test',
    },
    {
      name: 'TypeScript ESM',
      path: resolve(examplesDir, 'esm-typescript'),
      type: 'esm-typescript',
      testCommand: 'npm test',
    },
    {
      name: 'TypeScript CommonJS',
      path: resolve(examplesDir, 'cjs-typescript'),
      type: 'cjs-typescript',
      testCommand: 'npm test',
    },
  ];
}

/**
 * Validates the E2E configuration
 */
export async function validateConfig(config: E2EConfig): Promise<void> {
  const errors: string[] = [];

  // Check if packages directory exists
  try {
    await access(config.packagesDir);
  } catch {
    errors.push(`Packages directory not found: ${config.packagesDir}`);
  }

  // Check if examples directory exists
  try {
    await access(config.examplesDir);
  } catch {
    errors.push(`Examples directory not found: ${config.examplesDir}`);
  }

  // Validate port range
  if (config.verdaccioPort < 1024 || config.verdaccioPort > 65535) {
    errors.push(
      `Invalid port: ${config.verdaccioPort}. Must be between 1024-65535`,
    );
  }

  // Validate test version format
  if (!config.testVersion.match(/^\d+\.\d+\.\d+/)) {
    errors.push(`Invalid test version format: ${config.testVersion}`);
  }

  if (errors.length > 0) {
    throw new Error(
      `Configuration validation failed:\n${errors.map((e) => `- ${e}`).join('\n')}`,
    );
  }
}
