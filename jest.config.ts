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
      // moduleNameMapper: {
      //   '@ts-graphviz/dot-type': '<rootDir>/packages/dot-type/src/index.ts',
      //   '@ts-graphviz/dot-attribute': '<rootDir>/packages/dot-attribute/src/index.ts',
      //   '@ts-graphviz/model': '<rootDir>/packages/model/src/index.ts',
      //   'ts-graphviz': '<rootDir>/packages/ts-graphviz/src/index.ts',
      // },
    },
    {
      displayName: '@ts-graphviz/node',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/packages/node/src/**/?(*.)+(spec|test).ts?(x)'],
      ...projectCommonConfig,
      // moduleNameMapper: {
      //   'ts-graphviz': '<rootDir>/packages/ts-graphviz/src/index.ts',
      // },
    },
    {
      displayName: '@ts-graphviz/parser',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/packages/parser/src/**/?(*.)+(spec|test).ts?(x)',
        '<rootDir>/packages/parser/test/**/?(*.)+(spec|test).ts?(x)',
      ],
      ...projectCommonConfig,
      // moduleNameMapper: {
      //   'ts-graphviz': '<rootDir>/packages/ts-graphviz/src/index.ts',
      // },
      snapshotSerializers: ['jest-snapshot-serializer-raw'],
    },
    {
      displayName: '@ts-graphviz/model',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/packages/model/src/**/?(*.)+(spec|test).ts?(x)',
        '<rootDir>/packages/model/test/**/?(*.)+(spec|test1).ts?(x)',
      ],
      ...projectCommonConfig,
      // moduleNameMapper: {
      //   '@ts-graphviz/dot-type': '<rootDir>/packages/dot-type/src/index.ts',
      //   '@ts-graphviz/dot-attribute': '<rootDir>/packages/dot-attribute/src/index.ts',
      // },
      snapshotSerializers: ['jest-snapshot-serializer-raw'],
    },
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // testMatch: ['**/(__tests__|__specs__)/**/*.(spec|test).(ts|tsx)'],
  modulePathIgnorePatterns: ['<rootDir>/package.json'],
  moduleNameMapper: {
    '@ts-graphviz/dot-ast': '<rootDir>/packages/dot-ast/src/index.ts',
    '@ts-graphviz/dot-type': '<rootDir>/packages/dot-type/src/index.ts',
    '@ts-graphviz/dot-attribute': '<rootDir>/packages/dot-attribute/src/index.ts',
    '@ts-graphviz/model': '<rootDir>/packages/model/src/index.ts',
    '@ts-graphviz/parser': '<rootDir>/packages/parser/src/index.ts',
    '@ts-graphviz/renderer': '<rootDir>/packages/renderer/src/index.ts',
    '@ts-graphviz/node': '<rootDir>/packages/node/src/index.ts',
    '@ts-graphviz/react': '<rootDir>/packages/react/src/index.ts',
    'ts-graphviz': '<rootDir>/packages/ts-graphviz/src/index.ts',
  },
};
export default config;
