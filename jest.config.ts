import type { InitialOptionsTsJest } from 'ts-jest';
import { defaultsESM as tsjPreset } from 'ts-jest/presets';

const projectCommonConfig: InitialOptionsTsJest = {
  modulePathIgnorePatterns: ['<rootDir>/package.json'],
  setupFilesAfterEnv: ['./config/jest/setup-jest.ts'],
  transform: {
    ...tsjPreset.transform,
  },
};

const config: InitialOptionsTsJest = {
  preset: 'ts-jest/presets/default-esm',
  verbose: true,

  collectCoverage: true,
  watchPathIgnorePatterns: ['coverage'],
  projects: [
    {
      displayName: 'ts-graphviz',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/packages/ts-graphviz/src/**/?(*.)+(spec|test).ts'],
      ...projectCommonConfig,
    },
    {
      displayName: '@ts-graphviz/react',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/packages/react/src/**/?(*.)+(spec|test).ts?(x)'],
      ...projectCommonConfig,
      moduleNameMapper: {
        'ts-graphviz': '<rootDir>/packages/ts-graphviz/src/index.ts',
      },
    },
    {
      displayName: '@ts-graphviz/node',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/packages/node/src/**/?(*.)+(spec|test).ts?(x)'],
      ...projectCommonConfig,
      moduleNameMapper: {
        'ts-graphviz': '<rootDir>/packages/ts-graphviz/src/index.ts',
      },
    },
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // testMatch: ['**/(__tests__|__specs__)/**/*.(spec|test).(ts|tsx)'],
  modulePathIgnorePatterns: ['<rootDir>/package.json'],
};
export default config;
