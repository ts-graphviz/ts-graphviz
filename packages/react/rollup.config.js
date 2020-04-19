import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: [
    {
      format: 'cjs',
      file: pkg.main,
    },
    {
      format: 'esm',
      file: pkg.module,
    },
  ],
  plugins: [commonjs(), typescript(), terser()],
  external: ['react', 'react-dom/server', 'ts-graphviz', 'prop-types', 'react-reconciler'],
};
