import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';
import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';

/** @type {import('rollup').RollupOptions[]} */
const options = [
  {
    input: './src/index.ts',
    plugins: [
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            module: 'ESNext',
            declaration: true,
          },
        },
      }),
      terser({
        format: {
          comments: false,
        },
      }),
    ],
    external: ['ts-graphviz'],
    output: [
      {
        format: 'cjs',
        file: './lib/index.js',
      },
      {
        format: 'esm',
        file: './lib/index.mjs',
      },
    ],
  },
  {
    input: './lib/index.d.ts',
    plugins: [
      del({
        targets: ['lib/*.d.ts', '!lib/index.d.ts'],
        hook: 'buildEnd',
      }),
      dts(),
    ],
    external: ['ts-graphviz'],
    output: [
      {
        format: 'esm',
        file: './lib/index.d.ts',
      },
    ],
  },
];

export default options;
