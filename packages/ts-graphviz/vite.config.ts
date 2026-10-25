import { dts } from 'rolldown-plugin-dts';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // rolldown-plugin-dts emits .d.ts modules; keep Vite's Oxc transform off them.
  oxc: {
    exclude: [/\.js$/, /\.d\.[cm]?ts$/],
  },
  build: {
    target: 'ES2022',
    outDir: 'lib',
    lib: {
      entry: {
        'ts-graphviz': 'src/ts-graphviz.ts',
        ast: 'src/ast.ts',
        adapter: 'src/adapter.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        '@ts-graphviz/common',
        '@ts-graphviz/core',
        '@ts-graphviz/adapter',
        '@ts-graphviz/ast',
      ],
    },
  },
  plugins: [
    // Declarations come from Oxc, file by file (isolatedDeclarations), and
    // are bundled per entry; no TypeScript compiler is involved.
    dts({ generator: 'oxc', tsconfig: './tsconfig.json' }),
  ],
});
