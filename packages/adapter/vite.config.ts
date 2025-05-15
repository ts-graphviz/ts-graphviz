import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
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
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        '@ts-graphviz/common',
        'node:stream',
        'node:stream/promises',
        'node:child_process',
        'node:fs',
      ],
    },
  },
  plugins: [
    dts({
      tsconfigPath: './tsconfig.json',
    }),
    dts({
      tsconfigPath: './tsconfig.browser.json',
    }),
    dts({
      tsconfigPath: './tsconfig.deno.json',
    }),
  ],
});
