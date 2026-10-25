import { dts } from 'rolldown-plugin-dts';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // rolldown-plugin-dts emits .d.ts modules; keep Vite's Oxc transform off them.
  oxc: {
    exclude: [/\.js$/, /\.d\.[cm]?ts$/],
  },
  build: {
    target: 'ES2022',
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
        '@ts-graphviz/common',
        'react',
        'react/jsx-runtime',
        'react-reconciler',
        'react-reconciler/constants.js',
        'ts-graphviz',
      ],
    },
  },
  plugins: [
    // Declarations come from Oxc, file by file (isolatedDeclarations), and
    // are bundled per entry; no TypeScript compiler is involved. Build only:
    // under vitest (run in the package directory) there is no build input.
    ...dts({ generator: 'oxc', tsconfig: './tsconfig.json' }).map((plugin) => ({
      ...plugin,
      apply: 'build' as const,
    })),
  ],
});
