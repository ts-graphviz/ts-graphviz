import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { vitestTypescriptAssertPlugin } from 'vite-plugin-vitest-typescript-assert';

function entrypoint(packageName: string): string {
  return resolve(process.cwd(), './packages', packageName, 'src/index.ts');
}

export default defineConfig({
  resolve: {
    alias: {
      'ts-graphviz': entrypoint('ts-graphviz'),
      '@ts-graphviz/node': entrypoint('node'),
      '@ts-graphviz/react': entrypoint('react'),
    },
  },
  test: {
    coverage: {
      enabled: true,
      exclude: ['**/__mocks__/*', '**/__tests__/*', '**/index.{js,ts}'],
    },
    exclude: ['**/node_modules/**', 'packages/**/lib/**', 'packages/react', 'packages/parser'],
  },
  plugins: [vitestTypescriptAssertPlugin()],
});
