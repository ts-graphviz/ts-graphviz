import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'ES2022',
    outDir: './lib',
    minify: false,
    lib: {
      entry: {
        react: './src/react.ts',
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react-dom',
        'react-dom/server',
        'react-reconciler',
        'ts-graphviz',
      ],
    },
  },
  plugins: [
    // @ts-ignore
    dts({
      /**
       * Note: This option is not working properly.
       * API Extractor cannot export "declare module ..." types.
       *
       * See detail for https://github.com/microsoft/rushstack/issues/2090
       */
      // rollupTypes: true,
    }),
  ],
});
