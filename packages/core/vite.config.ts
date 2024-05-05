import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'ES2022',
    minify: false,
    lib: {
      entry: {
        'lib/AttributesBase': './src/lib/AttributesBase.ts',
        'lib/AttributeList': './src/lib/AttributeList.ts',
        'lib/AttributesGroup': './src/lib/AttributesGroup.ts',
        'lib/Digraph': './src/lib/Digraph.ts',
        'lib/Edge': './src/lib/Edge.ts',
        'lib/Graph': './src/lib/Graph.ts',
        'lib/GraphBase': './src/lib/GraphBase.ts',
        'lib/Node': './src/lib/Node.ts',
        'lib/RootGraph': './src/lib/RootGraph.ts',
        'lib/Subgraph': './src/lib/Subgraph.ts',
        core: './src/core.ts',
        'register-default': './src/register-default.ts',
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['@ts-graphviz/common', '@ts-graphviz/ast'],
    },
  },
  plugins: [
    // @ts-ignore
    dts({
      rollupTypes: true,
    }),
  ],
});
