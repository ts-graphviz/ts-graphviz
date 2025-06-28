export interface TestPackage {
  name: string;
  path: string;
  type:
    | 'esm-javascript'
    | 'cjs-javascript'
    | 'esm-typescript'
    | 'cjs-typescript';
  testCommand: string;
}

export interface E2EConfig {
  verdaccioPort: number;
  verdaccioConfig: string;
  testVersion: string;
  registryUrl: string;
  packagesDir: string;
  examplesDir: string;
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
