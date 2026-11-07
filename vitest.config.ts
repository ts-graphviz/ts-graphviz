import { readFileSync } from 'node:fs';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults, defineConfig } from 'vitest/config';

/**
 * The guarantees of the security model, as test tags: `SM-n` for each
 * `## SM-n. Title` section of the document. A test that backs a guarantee
 * carries its tag (`describe(name, { tags: ['SM-2'] }, …)`); a tag that is
 * not a section is an error (strictTags), and test/security-model.test.ts
 * checks that every guarantee the document says tests back has a test.
 */
const securityModel = readFileSync(
  new URL(
    './website/docs/ts-graphviz/11-advanced-topics/06-security-model.md',
    import.meta.url,
  ),
  'utf8',
);
const securityModelTags = [
  ...securityModel.matchAll(/^## (SM-\d+)\. (.+)$/gm),
].map(([, name, title]) => ({ name, description: title }));

/**
 * Tests that start a real process (Graphviz, a stand-in `dotCommand`, Biome)
 * carry the `process` tag. `pnpm test` leaves them out
 * (`--tags-filter='!process'`); `pnpm test:sandbox` runs them in a container
 * (scripts/test-sandbox.ts). test/process-tag.test.ts checks that every test
 * file that starts a process has the tag.
 */
const processTag = {
  name: 'process',
  description:
    'Starts a real process; left out of `pnpm test`, run by `pnpm test:sandbox`',
  // A default bound; a test with its own timeout keeps it.
  timeout: 120_000,
};

/**
 * Coverage thresholds (OpenSSF Best Practices, #1866): silver asks 80% of
 * statements, gold 90% of statements and 80% of branches. Vitest exits 1
 * below one, which fails `pnpm test` in CI. The per-package values are a
 * few points below what is measured, so that a regression in one package
 * is caught even when the total holds; raise them as coverage grows.
 *
 * Measured on `pnpm test` alone: the tests tagged `process` run in the
 * sandbox without coverage, so the code only they exercise (parts of the
 * adapter's to-stream code) counts as uncovered here.
 */
const coverageThresholds = {
  statements: 80,
  lines: 80,
  'packages/common/src/**': {
    statements: 94,
    branches: 92,
    functions: 90,
    lines: 94,
  },
  'packages/core/src/**': {
    statements: 96,
    branches: 90,
    functions: 96,
    lines: 96,
  },
  'packages/ast/src/**': {
    statements: 95,
    branches: 92,
    functions: 96,
    lines: 95,
  },
  'packages/adapter/src/**': {
    statements: 94,
    branches: 87,
    functions: 86,
    lines: 94,
  },
  'packages/ts-graphviz/src/**': {
    statements: 95,
    branches: 95,
    functions: 95,
    lines: 95,
  },
  'packages/react/src/**': {
    statements: 90,
    branches: 85,
    functions: 75,
    lines: 90,
  },
};

export default defineConfig({
  assetsInclude: ['**/*.dot'],
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: ['./test/properties/setup.ts', './test/process-guard.ts'],
    globalSetup: ['./test/process-notice.ts'],
    tags: [...securityModelTags, processTag],
    strictTags: true,
    // website/ has its own setup (website/vitest.config.ts)
    exclude: [...configDefaults.exclude, 'website/**'],
    coverage: {
      enabled: true,
      include: ['packages/**/src/**/*.ts'],
      // Only in CI (`CI=1 pnpm test` locally): a run of some test files
      // counts the rest as uncovered and would fail them all.
      thresholds: process.env.CI ? coverageThresholds : undefined,
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
