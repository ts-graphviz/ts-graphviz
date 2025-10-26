import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    target: 'ES2023',
    outDir: './lib',
    minify: false,
    lib: {
      entry: './src/ast.ts',
      formats: ['es'],
      fileName: 'ast',
    },
    rollupOptions: {
      external: ['@ts-graphviz/common'],
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
    }) as any,
  ],
});
