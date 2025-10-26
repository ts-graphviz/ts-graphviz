import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  assetsInclude: ['**/*.dot'],
  plugins: [tsconfigPaths()],
  test: {
    pool: 'threads',
    coverage: {
      enabled: true,
      include: ['packages/**/src/**/*.ts'],
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/test/**',
        '**/__tests__/**',
        '**/node_modules/**',
      ],
      ignoreClassMethods: ['constructor', 'toString', 'toJSON'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    typecheck: {
      enabled: true,
    },
    testTimeout: 0,
  },
});
