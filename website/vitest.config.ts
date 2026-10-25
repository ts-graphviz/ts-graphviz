import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const mock = (path: string) =>
  fileURLToPath(new URL(`./test/mocks/${path}`, import.meta.url));

// Unit and component tests of the site's own code. Docusaurus modules
// (@docusaurus/*, @theme/*) only exist inside a Docusaurus build, so they are
// replaced with small stand-ins; the end-to-end tests (e2e/) cover the real
// site.
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: [
      {
        find: '@site',
        replacement: fileURLToPath(new URL('.', import.meta.url)),
      },
      {
        find: '@docusaurus/Translate',
        replacement: mock('docusaurus-translate.tsx'),
      },
      {
        find: '@docusaurus/useBaseUrl',
        replacement: mock('docusaurus-use-base-url.ts'),
      },
      {
        find: '@docusaurus/theme-common',
        replacement: mock('docusaurus-theme-common.ts'),
      },
      { find: '@theme/CodeBlock', replacement: mock('theme-code-block.tsx') },
      { find: '@theme/Tabs', replacement: mock('theme-tabs.tsx') },
      { find: '@theme/TabItem', replacement: mock('theme-tab-item.tsx') },
    ],
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}', 'plugins/**/*.test.ts'],
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
  },
});
