import { RollupOptions } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';
import dts from 'rollup-plugin-dts';

function* createOptions(watch?: boolean): Generator<RollupOptions> {
  yield {
    input: './src/index.ts',
    plugins: [typescript()],
    external: ['@ts-graphviz/model', '@ts-graphviz/dot-ast'],
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
  };

  yield {
    input: ['src/parse.d.ts'],
    plugins: [dts()],
    output: [
      {
        format: 'esm',
        file: './lib/src/parse.d.ts',
      },
    ],
  };

  if (!watch) {
    yield {
      input: './lib/src/index.d.ts',
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
    };
  }
}

export default (args: { watch?: boolean }) => [...createOptions(args.watch)];
