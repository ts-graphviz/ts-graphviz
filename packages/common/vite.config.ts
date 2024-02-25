import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    outDir: './lib',
    minify: false,
    lib: {
      entry: {
        common: './src/common.ts',
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {},
  },
  plugins: [
    dts({
      rollupTypes: true,
    }),
  ],
});
