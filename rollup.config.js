import del from 'rollup-plugin-delete';
import dts from 'rollup-plugin-dts';
import replace from '@rollup/plugin-replace';

function* createOptions() {
  const subPackages = ['utils', 'common', 'ast', 'core', 'adapter'];
  const subPackageEntrypoints = subPackages.flatMap((subPackage) => [
    `../${subPackage}/index.js`,
    `../../${subPackage}/index.js`,
    `../../../${subPackage}/index.js`,
    `../../../../${subPackage}/index.js`,
    `../../../../../${subPackage}/index.js`,
    `../../../../../../${subPackage}/index.js`,
  ]);
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
    yield {
      input: `./lib/${subPackage}/index.cjs`,
      output: {
        format: 'cjs',
        file: `./lib/${subPackage}/index.cjs`,
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

  yield {
    input: './lib/index.cjs',
    output: {
      format: 'cjs',
      file: './lib/index.cjs',
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
