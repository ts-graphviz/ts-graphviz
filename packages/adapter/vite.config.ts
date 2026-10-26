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
        'create-command-and-args': './src/create-command-and-args.ts',
        deno: './src/deno.ts',
        browser: './src/browser.ts',
        node: './src/node.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        '@ts-graphviz/ast',
        '@ts-graphviz/common',
        // Node.js built-ins (bundling one would put a browser stub in).
        /^node:/,
      ],
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
