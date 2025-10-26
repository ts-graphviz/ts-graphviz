import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'ES2023',
    outDir: './lib',
    minify: false,
    lib: {
      entry: {
        react: './src/react.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react-reconciler',
        'ts-graphviz',
      ],
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
    }) as any,
  ],
});
