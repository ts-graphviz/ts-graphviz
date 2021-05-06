import path from 'path';
import { rollup } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';
// import { terser } from 'rollup-plugin-terser';
import rimraf from 'rimraf';

async function build(): Promise<void> {
  await rollup({
    input: path.resolve(__dirname, '../src/index.ts'),
    plugins: [typescript()],
    external: ['ts-graphviz'],
  }).then((result) =>
    Promise.all([
      result.write({
        format: 'cjs',
        file: path.resolve(__dirname, '../lib/index.js'),
      }),
      result.write({
        format: 'esm',
        file: path.resolve(__dirname, '../lib/index.mjs'),
      }),
    ]),
  );

  await rollup({
    input: path.resolve(__dirname, '../lib/index.d.ts'),
    plugins: [dts()],
    external: ['ts-graphviz'],
  }).then(async (result) => {
    rimraf.sync(path.resolve(__dirname, '../lib/**/*.d.ts'));
    await result.write({
      format: 'esm',
      file: path.resolve(__dirname, '../lib/index.d.ts'),
    });
  });
}

build();
