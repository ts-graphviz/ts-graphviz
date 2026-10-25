import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  assetsInclude: ['**/*.dot'],
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: ['./test/properties/setup.ts'],
    // website/ has its own setup (website/vitest.config.ts)
    exclude: [...configDefaults.exclude, 'website/**'],
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
