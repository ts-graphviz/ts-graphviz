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

export default defineConfig({
  assetsInclude: ['**/*.dot'],
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: ['./test/properties/setup.ts'],
    tags: securityModelTags,
    strictTags: true,
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
