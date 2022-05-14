import type { InitialOptionsTsJest } from 'ts-jest';
import { defaultsESM as tsjPreset } from 'ts-jest/presets';

const config: InitialOptionsTsJest = {
  preset: 'ts-jest/presets/default-esm',
  verbose: true,

  collectCoverage: true,
  watchPathIgnorePatterns: ['coverage'],
  projects: [
    {
      displayName: 'ts-graphviz',
      testEnvironment: 'node',
      modulePathIgnorePatterns: ['<rootDir>/package.json'],

      testMatch: ['<rootDir>/packages/ts-graphviz/src/**/?(*.)+(spec|test).ts'],
      setupFilesAfterEnv: ['./config/jest/setup-jest.ts'],
      transform: {
        ...tsjPreset.transform,
      },
    },
    {
      displayName: '@ts-graphviz/react',
      testEnvironment: 'jsdom',
      modulePathIgnorePatterns: ['<rootDir>/package.json'],

      testMatch: ['<rootDir>/packages/react/src/**/?(*.)+(spec|test).ts?(x)'],
      setupFilesAfterEnv: ['./config/jest/setup-jest.ts'],
      transform: {
        ...tsjPreset.transform,
      },
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
