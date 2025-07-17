import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  assetsInclude: ['**/*.dot'],
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      enabled: true,
      include: ['packages/**/src/**/*.ts'],
    },
    typecheck: {
      enabled: true,
    },
    testTimeout: 0,
  },
});
