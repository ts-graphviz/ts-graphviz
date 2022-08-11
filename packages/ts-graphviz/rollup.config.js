import { default as typescript} from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';
import dts from 'rollup-plugin-dts';

/**
 * @param {boolean?} watch
 * @return {Generator<import('rollup').RollupOptions>}
 */
function* createOptions(watch) {
  yield {
    input: './src/index.ts',
    plugins: [typescript()],
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
    input: ['src/parser/parse.d.ts'],
    plugins: [dts()],
    output: [
      {
        format: 'esm',
        file: './lib/src/parser/parse.d.ts',
      },
    ],
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
    };
  }
}

export default (args) => [...createOptions(args.watch)];
