import { defineConfig } from 'vitest/config';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    outDir: './lib',
    minify: false,
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['@ts-graphviz/common', '@ts-graphviz/core', '@ts-graphviz/ast', '@ts-graphviz/adapter'],
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
    }),
  ],
  test: {
    environment: 'node',
  },
});
