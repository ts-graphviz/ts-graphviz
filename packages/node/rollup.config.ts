import { RollupOptions } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';
import dts from 'rollup-plugin-dts';

function* createOptions(watch?: boolean): Generator<RollupOptions> {
  yield {
    input: './src/index.ts',
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
    plugins: [typescript()],
    external: ['ts-graphviz', 'node:child_process', 'tmp-promise', 'util', 'fs'],
  };
  if (!watch) {
  yield {
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
    external: ['ts-graphviz', 'node:child_process', 'tmp-promise'],
  };
  }
}

export default (args: { watch?: boolean }) => [...createOptions(args.watch)];
