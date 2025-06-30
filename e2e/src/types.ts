export interface TestPackage {
  name: string;
  path: string;
  testCommand: string;
  // Optional metadata for custom handling
  metadata?: Record<string, any>;
  // Runtime detection for Deno/Node.js compatibility
  runtime?: 'node' | 'deno' | 'auto';
}

export interface RegistryConfig {
  port?: number;
  host?: string;
  auth?: {
    username: string;
    password: string;
    email: string;
  };
}

export interface PackageDiscoveryConfig {
  // Auto-discovery from pnpm workspace
  workspace?: {
    enabled: boolean;
    // Patterns to include/exclude from workspace packages
    include?: string[];
    exclude?: string[];
  };

  // Manual package specification (fallback when workspace discovery fails)
  manual?: {
    // Explicit list of package directories or patterns
    packages: string[];
  };
}

export interface E2ERunnerConfig {
  // Package configuration
  packages: {
    sourceDir: string;
    testVersion?: string;
    // Package discovery configuration
    discovery?: PackageDiscoveryConfig;
  };

  // Registry configuration
  registry: RegistryConfig;

  // Runtime options
  options?: {
    parallel?: boolean;
    timeout?: number;
    maxRetries?: number;
    cleanup?: boolean;
  };
}

export interface TestResult {
  package: TestPackage;
  success: boolean;
  duration: number;
  output?: string;
  error?: Error;
}

export interface VerdaccioInstance {
  start(): Promise<void>;
  stop(): Promise<void>;
  isRunning(): boolean;
  getRegistryUrl(): string;
}
