import del from 'rollup-plugin-delete';
import dts from 'rollup-plugin-dts';
const external = [
  '@ts-graphviz/common',
  '../types/index.js',
  '../utils/index.js',
  'node:stream',
  'node:child_process',
  'node:fs',
  'node:util',
];
function createOption(name) {
  return [
    {
      input: `./lib/${name}/index.js`,
      output: [
        {
          format: `cjs`,
          file: `./lib/${name}/index.cjs`,
        },
        {
          format: `esm`,
          file: `./lib/${name}/index.js`,
        },
      ],
      external,
    },
    {
      input: `./lib/${name}/index.d.ts`,
      plugins: [
        del({
          targets: [`lib/${name}/**/*.js`, `lib/${name}/**/*.d.ts`, `!lib/${name}/index.{js,d.ts}`],
          hook: 'buildEnd',
        }),
        dts(),
      ],
      output: [
        {
          format: 'esm',
          file: `./lib/${name}/index.d.ts`,
        },
      ],
      external,
    },
  ];
}

/** @type {import('rollup').RollupOptions[]} */
const options = [...['types', 'utils', 'browser', 'node'].flatMap(createOption)];

export default options;
