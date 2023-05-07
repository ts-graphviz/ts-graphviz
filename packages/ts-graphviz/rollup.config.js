import del from 'rollup-plugin-delete';
import dts from 'rollup-plugin-dts';

/** @type {import('rollup').RollupOptions[]} */
const options = [
  {
    input: './lib/index.js',
    output: [
      {
        format: 'cjs',
        file: './lib/index.cjs',
      },
      {
        format: 'esm',
        file: './lib/index.js',
      },
    ],
    external: ['@ts-graphviz/common', '@ts-graphviz/core'],
  },
  {
    input: './lib/index.d.ts',
    plugins: [
      del({
        targets: ['lib/**/*.js', 'lib/**/*.d.ts', '!lib/index.{js,d.ts}'],
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
    external: ['@ts-graphviz/common', '@ts-graphviz/core'],
  },
];

export default options;
