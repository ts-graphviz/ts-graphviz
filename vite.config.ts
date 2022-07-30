import { defineConfig } from 'vite';

export default defineConfig({
  // resolve: {
  //   alias: {
  //     '@ts-graphviz/dot-ast': 'packages/dot-ast/src/index.ts',
  //     '@ts-graphviz/dot-attribute': 'packages/dot-attribute/src/index.ts',
  //     '@ts-graphviz/dot-type': 'packages/dot-type/src/index.ts',
  //     '@ts-graphviz/model': 'packages/model/src/index.ts',
  //     '@ts-graphviz/node': 'packages/node/src/index.ts',
  //     '@ts-graphviz/parser': 'packages/parser/src/index.ts',
  //     '@ts-graphviz/react': 'packages/react/src/index.ts',
  //     '@ts-graphviz/renderer': 'packages/renderer/src/index.ts',
  //     'ts-graphviz': 'packages/ts-graphviz/src/index.ts',
  //   },
  // },
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
});
