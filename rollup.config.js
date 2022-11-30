import del from 'rollup-plugin-delete';
import dts from 'rollup-plugin-dts';
import replace from '@rollup/plugin-replace';

function* createOptions() {
  const subPackages = ['utils', 'common', 'ast', 'core'];
  const subPackageEntrypoints = subPackages.flatMap((subPackage) => [
    `../${subPackage}/index.js`,
    `../../${subPackage}/index.js`,
    `../../../${subPackage}/index.js`,
    `../../../../${subPackage}/index.js`,
    `../../../../../${subPackage}/index.js`,
    `../../../../../../${subPackage}/index.js`,
  ]);
  yield {
    input: './lib/js/index.js',
    output: [
      {
        format: 'cjs',
        file: './lib/js/index.cjs',
      },
      {
        format: 'esm',
        file: './lib/js/index.js',
      },
    ],
    external: subPackages.map((subPackage) => `./${subPackage}/index.js`),
  };

  for (const subPackage of subPackages) {
    yield {
      input: `./lib/js/${subPackage}/index.js`,
      output: [
        {
          format: 'cjs',
          file: `./lib/js/${subPackage}/index.cjs`,
        },
        {
          format: 'esm',
          file: `./lib/js/${subPackage}/index.js`,
        },
      ],
      external: subPackageEntrypoints,
    };
    yield {
      input: `lib/js/${subPackage}/index.d.ts`,
      plugins: [
        del({
          targets: [`lib/js/${subPackage}/**/*`, `!lib/js/${subPackage}/**/index.*`],
          hook: 'buildEnd',
        }),
        dts(),
      ],
      output: [
        {
          format: 'esm',
          file: `lib/ts/${subPackage}/index.d.ts`,
        },
      ],
      external: subPackageEntrypoints,
    };
    yield {
      input: `./lib/js/${subPackage}/index.cjs`,
      output: {
        format: 'cjs',
        file: `./lib/js/${subPackage}/index.cjs`,
      },
      external: subPackageEntrypoints,
      plugins: [
        replace({
          values: subPackages.reduce(
            (prev, subPackage) => ({ ...prev, [`${subPackage}/index.js`]: `${subPackage}/index.cjs` }),
            {},
          ),
          preventAssignment: true,
        }),
      ],
    };
  }

  yield {
    input: './lib/js/index.d.ts',
    plugins: [
      del({
        targets: ['lib/*.js', 'lib/**/*.d.ts', '!lib/ts/**/index.{js,d.ts}'],
        hook: 'buildEnd',
      }),
      dts(),
    ],
    output: [
      {
        format: 'esm',
        file: './lib/ts/index.d.ts',
      },
    ],
    external: subPackages.map((subPackage) => `./${subPackage}/index.js`),
  };

  yield {
    input: './lib/js/index.cjs',
    output: {
      format: 'cjs',
      file: './lib/js/index.cjs',
    },
    external: subPackages.map((subPackage) => `./${subPackage}/index.js`),
    plugins: [
      replace({
        values: subPackages.reduce(
          (prev, subPackage) => ({ ...prev, [`${subPackage}/index.js`]: `${subPackage}/index.cjs` }),
          {},
        ),
        preventAssignment: true,
      }),
    ],
  };
}

export default [...createOptions()];
