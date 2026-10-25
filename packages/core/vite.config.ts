import { dts } from 'rolldown-plugin-dts';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // rolldown-plugin-dts emits .d.ts modules; keep Vite's Oxc transform off them.
  oxc: {
    exclude: [/\.js$/, /\.d\.[cm]?ts$/],
  },
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
    // Declarations come from Oxc, file by file (isolatedDeclarations), and
    // are bundled per entry; no TypeScript compiler is involved. Build only:
    // under vitest (run in the package directory) there is no build input.
    ...dts({ generator: 'oxc', tsconfig: './tsconfig.json' }).map((plugin) => ({
      ...plugin,
      apply: 'build' as const,
    })),
  ],
});
