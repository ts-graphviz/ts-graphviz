import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  setupFilesAfterEnv: ['<rootDir>/config/jest/setup-jest.ts'],
};
export default config;
