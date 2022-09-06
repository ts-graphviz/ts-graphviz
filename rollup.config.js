import del from 'rollup-plugin-delete';
import dts from 'rollup-plugin-dts';

function* createOptions() {
  const subPackages = ['type', 'attribute', 'ast', 'model'];
  yield {
    input: './lib/index.js',
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
    external: subPackages.map((subPackage) => `./${subPackage}/index.js`),
  };

  for (const subPackage of subPackages) {
    const subPackageEntrypoints = subPackages.map((subPackage) => `../${subPackage}/index.js`);
    yield {
      input: `./lib/${subPackage}/index.js`,
      output: [
        {
          format: 'cjs',
          file: `./lib/${subPackage}/index.cjs`,
        },
        {
          format: 'esm',
          file: `./lib/${subPackage}/index.js`,
        },
      ],
      external: subPackageEntrypoints,
    };
    yield {
      input: `lib/${subPackage}/index.d.ts`,
      plugins: [
        del({
          targets: [`lib/${subPackage}/**/*`, `!lib/${subPackage}/**/index.*`],
          hook: 'buildEnd',
        }),
        dts(),
      ],
      output: [
        {
          format: 'esm',
          file: `lib/${subPackage}/index.d.ts`,
        },
      ],
      external: subPackageEntrypoints,
    };
  }

  yield {
    input: './lib/index.d.ts',
    plugins: [
      del({
        targets: ['lib/*.js', 'lib/**/*.d.ts', '!lib/**/index.{js,d.ts}'],
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
    external: subPackages.map((subPackage) => `./${subPackage}/index.js`),
  };
}

export default [...createOptions()];
