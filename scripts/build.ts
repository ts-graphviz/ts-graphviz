import { rollup } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';
import { remove } from 'fs-extra';
import glob from 'glob';

async function build({ input, output }: { input: string; output: string }): Promise<void> {
  const bundle = await rollup({
    input,
    plugins: [typescript()],
  });
  await Promise.all([
    bundle.write({
      format: 'cjs',
      file: `${output}/index.js`,
    }),
    bundle.write({
      format: 'esm',
      file: `${output}/index.mjs`,
    }),
    bundle.write({
      format: 'umd',
      name: 'graphviz',
      plugins: [terser()],
      file: `${output}/bundle.min.js`,
    }),
  ]);
}

async function rollupDts({
  input,
  inputDir,
  output,
}: {
  input: string;
  inputDir: string;
  output: string;
}): Promise<void> {
  const bundle = await rollup({
    input: `${inputDir}/${input}`,
    plugins: [dts()],
  });
  const matches = await new Promise<string[]>((resolve, reject) => {
    glob(`${inputDir}/**/*.d.ts`, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
  await Promise.all(matches.map((match) => remove(match)));

  await bundle.write({
    format: 'es',
    file: `${output}/index.d.ts`,
  });
}

(async (): Promise<void> => {
  await remove('lib');
  await build({
    input: 'src/index.ts',
    output: 'lib',
  });
  await rollupDts({
    inputDir: 'lib',
    input: 'index.d.ts',
    output: 'lib',
  });
})();
