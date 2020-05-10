import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

export default {
  input: './src/index.ts',
  output: [
    {
      format: 'cjs',
      file: './lib/index.js',
    },
    {
      format: 'esm',
      file: './lib/index.mjs',
    },
    {
      format: 'umd',
      name: 'graphviz',
      file: './lib/bundle.min.js',
    },
  ],
  plugins: [typescript(), terser()],
};
