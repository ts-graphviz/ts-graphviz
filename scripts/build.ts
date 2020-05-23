import { rollup } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import { remove } from 'fs-extra';

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

(async (): Promise<void> => {
  await remove('lib');
  await build({
    input: 'src/index.ts',
    output: 'lib',
  });
})();
