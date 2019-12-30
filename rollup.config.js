import typescript from 'rollup-plugin-typescript2';

export default {
  input: './src/index.ts',
  output: {
    format: 'esm',
    dir: './lib/',
    entryFileNames: '[name].js',
  },
  format: 'es6',
  plugins: [
    typescript()
  ]
}
