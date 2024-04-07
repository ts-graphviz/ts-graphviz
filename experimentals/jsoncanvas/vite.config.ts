import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'ES2022',
    outDir: './lib',
    minify: false,
    lib: {
      entry: {
        jsoncanvas: './src/jsoncanvas.ts',
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
