import del from 'rollup-plugin-delete';
import dts from 'rollup-plugin-dts';

const external = ['@ts-graphviz/ast', '@ts-graphviz/common'];

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
    external,
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
    external,
  },
];

export default options;
