import { access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { E2ERunnerConfig, TestPackage } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '../..');

/**
 * Creates a default configuration
 */
export function createDefaultConfig(): E2ERunnerConfig {
  const testVersion = `0.0.0-e2e-${Date.now()}`;
  
  return {
    packages: {
      sourceDir: resolve(projectRoot, 'packages'),
      testVersion,
      // Auto-discovery configuration
      discovery: {
        workspace: {
          enabled: true,
          // Default patterns to include common package naming conventions
          include: ['*', '@*/*'],
          // Exclude common non-publishable packages
          exclude: ['*-dev', '*-test', '*-example*', '*e2e*'],
        },
      },
    },
    registry: {
      port: 4873,
      host: 'localhost',
      // Note: auth credentials are generated dynamically by VerdaccioManager for security
      auth: {
        username: '', // Will be overridden with secure random values
        password: '',
        email: '',
      },
    },
    options: {
      parallel: false,
      timeout: 60000,
      maxRetries: 0,
      cleanup: true,
    },
  };
}

/**
 * Creates a configuration from provided options
 */
export function createConfig(options: Partial<E2ERunnerConfig> = {}): E2ERunnerConfig {
  const defaultConfig = createDefaultConfig();
  
  return {
    packages: {
      ...defaultConfig.packages,
      ...options.packages,
    },
    registry: {
      ...defaultConfig.registry,
      ...options.registry,
    },
    options: {
      ...defaultConfig.options,
      ...options.options,
    },
  };
}


/**
 * Validates the E2E runner configuration
 */
export async function validateConfig(config: E2ERunnerConfig, testPackages: TestPackage[]): Promise<void> {
  const errors: string[] = [];

  // Validate packages configuration
  if (!config.packages.sourceDir) {
    errors.push('packages.sourceDir is required');
  } else {
    try {
      await access(config.packages.sourceDir);
    } catch {
      errors.push(`Source directory not found: ${config.packages.sourceDir}`);
    }
  }

  if (!testPackages || testPackages.length === 0) {
    errors.push('At least one test package is required');
  } else {
    // Validate each test package
    for (const pkg of testPackages) {
      if (!pkg.name || !pkg.path || !pkg.testCommand) {
        errors.push(`Invalid test package: ${JSON.stringify(pkg)}`);
      } else {
        try {
          await access(pkg.path);
        } catch {
          errors.push(`Test package directory not found: ${pkg.path}`);
        }
      }
    }
  }

  // Validate registry configuration
  const port = config.registry.port || 4873;
  if (port < 1024 || port > 65535) {
    errors.push(`Invalid port: ${port}. Must be between 1024-65535`);
  }

  // Validate test version format if provided
  if (config.packages.testVersion && !config.packages.testVersion.match(/^\d+\.\d+\.\d+/)) {
    errors.push(`Invalid test version format: ${config.packages.testVersion}`);
  }

  if (errors.length > 0) {
    throw new Error(
      `Configuration validation failed:\n${errors.map((e) => `- ${e}`).join('\n')}`,
    );
  }
}

/**
 * Utility function to get registry URL from config
 */
export function getRegistryUrl(config: E2ERunnerConfig): string {
  const host = config.registry.host || 'localhost';
  const port = config.registry.port || 4873;
  return `http://${host}:${port}`;
}
