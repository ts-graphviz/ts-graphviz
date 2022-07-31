import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { vitestTypescriptAssertPlugin } from 'vite-plugin-vitest-typescript-assert';

function entrypoint(packageName: string): string {
  return resolve(process.cwd(), './packages', packageName, 'src/index.ts');
}

export default defineConfig({
  resolve: {
    alias: {
      '@ts-graphviz/dot-ast': entrypoint('dot-ast'),
      '@ts-graphviz/dot-attribute': entrypoint('dot-attribute'),
      '@ts-graphviz/dot-type': entrypoint('dot-type'),
      '@ts-graphviz/model': entrypoint('model'),
      '@ts-graphviz/node': entrypoint('node'),
      '@ts-graphviz/parser': entrypoint('parser'),
      '@ts-graphviz/react': entrypoint('react'),
      '@ts-graphviz/renderer': entrypoint('renderer'),
      'ts-graphviz': entrypoint('ts-graphviz'),
    },
  },
  optimizeDeps: {
    //
  },
  test: {
    coverage: {
      enabled: true,
      exclude: ['**/__mocks__/*', '**/__tests__/*', '**/index.{js,ts}'],
    },
    exclude: ['**/node_modules/**', 'packages/**/lib/**', 'packages/react'],
  },
  plugins: [vitestTypescriptAssertPlugin()],
});
