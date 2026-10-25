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
      // Type tests (`*.test-d.ts`) are checked on their own, with the
      // sources they import; the other test files are run, not type-checked
      // here (`pnpm typecheck` covers them).
      tsconfig: './tsconfig.typecheck.json',
    },
    testTimeout: 0,
  },
});
