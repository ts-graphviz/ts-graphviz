import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'ES2022',
    outDir: './lib',
    minify: false,
    lib: {
      entry: {
        DotObject: './src/DotObject.ts',
        AttributesBase: './src/AttributesBase.ts',
        AttributeList: './src/AttributeList.ts',
        AttributesGroup: './src/AttributesGroup.ts',
        Digraph: './src/Digraph.ts',
        Edge: './src/Edge.ts',
        Graph: './src/Graph.ts',
        GraphBase: './src/GraphBase.ts',
        Node: './src/Node.ts',
        RootGraph: './src/RootGraph.ts',
        Subgraph: './src/Subgraph.ts',
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
    dts({
      rollupTypes: true,
    }),
  ],
});
