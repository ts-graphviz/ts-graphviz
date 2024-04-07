import { appendFile, readFile } from 'node:fs/promises';
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
      rollupTypes: true,
      async afterBuild() {
        const contents = await readFile(
          new URL(import.meta.resolve('./src/global.d.ts')).pathname,
          'utf-8',
        );
        await appendFile(
          new URL(import.meta.resolve('./lib/react.d.ts')).pathname,
          contents,
        );
      },
    }),
  ],
});
