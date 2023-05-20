import { defineConfig } from 'vitest/config';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    outDir: './lib',
    minify: false,
    lib: {
      entry: {
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
        'node:util',
      ],
    },
  },
  plugins: [
    dts({
      tsConfigFilePath: './tsconfig.node.json',
    }),
    dts({
      rollupTypes: true,
      tsConfigFilePath: './tsconfig.deno.json',
    }),
  ],
  test: {
    environment: 'node',
  },
});
