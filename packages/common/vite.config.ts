import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'ES2022',
    outDir: './lib',
    minify: false,
    lib: {
      entry: {
        common: './src/common.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {},
  },
  plugins: [
    dts({
      rollupTypes: true,
    }) as any,
  ],
});
