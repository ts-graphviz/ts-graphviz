import { rollup } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import { move, remove } from 'fs-extra';

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
  await Promise.all([remove('core'), remove('web')]);
  await Promise.all([
    build({
      input: 'src/index.ts',
      output: 'core',
      declaration: true,
      external: ['react', 'react-dom/server', 'ts-graphviz', 'prop-types', 'react-reconciler'],
    }),
    build({
      input: 'src/web/index.ts',
      output: 'core/web',
      declaration: false,
      external: ['react', 'react-dom/server', 'ts-graphviz', 'react-reconciler', '@hpcc-js/wasm'],
    }),
  ]);

  await move('core/web', 'web');
})();
