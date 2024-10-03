import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'ES2022',
    outDir: 'lib',
    lib: {
      entry: {
        types: 'src/types.ts',
        'ts-graphviz': 'src/ts-graphviz.ts',
        ast: 'src/ast.ts',
        adapter: 'src/adapter.ts',
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        '@ts-graphviz/common',
        '@ts-graphviz/core',
        '@ts-graphviz/adapter',
        '@ts-graphviz/ast',
      ],
    },
  },
  plugins: [
    dts({
      outDir: 'lib',
      rollupTypes: true,
    }),
  ],
});
