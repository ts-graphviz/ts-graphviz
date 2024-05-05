import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'ES2022',
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
    // @ts-ignore
    dts({
      rollupTypes: true,
    }),
  ],
});
