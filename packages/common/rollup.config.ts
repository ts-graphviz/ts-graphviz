import { RollupOptions } from 'rollup';
import del from 'rollup-plugin-delete';
import dts from 'rollup-plugin-dts';

function* createOptions(name: string, external: string[] = []): Generator<RollupOptions> {
  yield {
    input: `./lib/${name}/index.js`,
    plugins: [
      del({
        targets: [`lib/${name}/*.js`, `!lib/${name}/index.js`],
        hook: 'buildEnd',
      }),
    ],
    output: [
      {
        format: 'esm',
        file: `./lib/${name}/index.js`,
      },
      {
        format: 'cjs',
        file: `./lib/${name}/index.cjs`,
      },
    ],
    external,
  };
  yield {
    input: `./lib/${name}/index.d.ts`,
    plugins: [
      del({
        targets: [`lib/${name}/*.d.ts`, `!lib/${name}/index.d.ts`],
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
  };
}

const options: RollupOptions[] = [
  ...createOptions('attribute'),
  ...createOptions('AST', ['../attribute']),
  ...createOptions('graphviz'),
  ...createOptions('.', ['./AST', './attribute', './graphviz']),
];

export default options;
