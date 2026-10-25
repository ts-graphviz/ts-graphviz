import { dts } from 'rolldown-plugin-dts';
import { defineConfig } from 'vite';

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
        ast: './src/ast.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['@ts-graphviz/common'],
    },
  },
  plugins: [
    // Declarations come from Oxc, file by file (isolatedDeclarations), and
    // are bundled per entry; no TypeScript compiler is involved.
    dts({ generator: 'oxc', tsconfig: './tsconfig.json' }),
  ],
});
