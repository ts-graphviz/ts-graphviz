import { RollupOptions } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';
import dts from 'rollup-plugin-dts';

const options: RollupOptions[] = [
  {
    input: './src/index.ts',
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
    plugins: [typescript()],
    external: ['ts-graphviz', 'child_process', 'tmp-promise', 'util', 'fs'],
  },
  {
    input: './lib/index.d.ts',
    plugins: [
      del({
        targets: ['lib/**/*.d.ts', '!lib/index.d.ts'],
        hook: 'buildEnd',
      }),
      dts(),
    ],
    output: [
      {
        format: 'esm',
        file: './lib/index.d.ts',
      },
    ],
  },
];

export default options;
