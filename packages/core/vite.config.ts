import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    outDir: './lib',
    minify: false,
    lib: {
      entry: './src/core.ts',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['@ts-graphviz/common', '@ts-graphviz/ast'],
    },
  },
  plugins: [
    dts({
      outDir: './lib',
      rollupTypes: true,
    }),
  ],
});
