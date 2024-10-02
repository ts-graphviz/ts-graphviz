import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'ES2022',
    outDir: './lib',
    minify: false,
    lib: {
      entry: {
        models: './src/models.ts',
        core: './src/core.ts',
        'register-default': './src/register-default.ts',
      },
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
