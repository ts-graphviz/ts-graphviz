import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'ES2022',
    outDir: './lib',
    minify: false,
    lib: {
      entry: {
        DotObject: './src/models/DotObject.ts',
        AttributesBase: './src/attributes/AttributesBase.ts',
        AttributeList: './src/attributes/AttributeList.ts',
        AttributesGroup: './src/attributes/AttributesGroup.ts',
        Digraph: './src/models/Digraph.ts',
        Edge: './src/models/Edge.ts',
        Graph: './src/models/Graph.ts',
        GraphBase: './src/models/GraphBase.ts',
        Node: './src/models/Node.ts',
        RootGraph: './src/models/RootGraph.ts',
        Subgraph: './src/models/Subgraph.ts',
        core: './src/core.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['@ts-graphviz/common'],
    },
  },
  plugins: [
    dts({
      bundleTypes: true,
    }),
  ],
});
