import { rollup } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import { remove } from 'fs-extra';

async function build({
  input,
  output,
  declaration,
  external,
}: {
  input: string;
  output: string;
  declaration: boolean;
  external: string[];
}): Promise<void> {
  const bundle = await rollup({
    input,
    plugins: [
      commonjs(),
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            module: 'ESNext',
            declaration,
          },
        },
      }),
      terser(),
    ],
    external,
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
  ]);
}

(async (): Promise<void> => {
  await remove('lib');
  await build({
    input: 'src/index.ts',
    output: 'lib',
    declaration: true,
    external: ['react', 'react-dom/server', 'ts-graphviz', 'prop-types', 'react-reconciler', '@hpcc-js/wasm'],
  });
})();
