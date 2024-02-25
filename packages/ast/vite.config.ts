import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    outDir: './lib',
    minify: false,
    lib: {
      entry: './src/ast.ts',
      formats: ['es', 'cjs'],
      fileName: 'ast',
    },
    rollupOptions: {
      external: ['@ts-graphviz/common'],
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
    }),
  ],
});
