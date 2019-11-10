module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  setupFilesAfterEnv: [
    '<rootDir>/config/jest/setup-jest.ts',
  ],
};
