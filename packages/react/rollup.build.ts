import { rollup } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
import { remove, removeSync } from 'fs-extra';
import glob from 'glob';

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
    ],
    external,
  });
  await Promise.all([
    bundle.write({
      format: 'cjs',
      file: `${output}/index.js`,
    }),
    bundle.write({
      format: 'cjs',
      file: `${output}/index.min.js`,
      plugins: [terser()],
    }),
    bundle.write({
      format: 'esm',
      file: `${output}/index.mjs`,
    }),
    bundle.write({
      format: 'esm',
      file: `${output}/index.min.mjs`,
      plugins: [terser()],
    }),
  ]);
}

async function rollupDts({ output, external }: { output: string; external: string[] }): Promise<void> {
  const bundle = await rollup({
    input: `${output}/index.d.ts`,
    plugins: [dts()],
    external,
  });

  glob.sync(`${output}/**/*.d.ts`).forEach((file) => removeSync(file));

  await Promise.all([
    bundle.write({
      format: 'es',
      file: `${output}/index.d.ts`,
    }),
  ]);
}

(async (): Promise<void> => {
  await remove('lib');
  await build({
    input: 'src/index.ts',
    output: 'lib',
    declaration: true,
    external: ['react', 'react-dom/server', 'ts-graphviz', 'prop-types', 'react-reconciler'],
  });
  await rollupDts({
    output: 'lib',
    external: ['react', 'react-dom/server', 'ts-graphviz', 'prop-types', 'react-reconciler'],
  });
})();
