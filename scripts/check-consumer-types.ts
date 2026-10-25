/**
 * Type-check the packages as users install them: pack every publishable
 * package the way `pnpm publish` would (so `publishConfig` is applied), lay
 * the tarballs out in the node_modules of a temporary consumer project, and
 * type-check the fixtures in test/consumer/ against them with several
 * TypeScript versions and module settings. Run with
 * `pnpm check:consumer-types` after `pnpm build`.
 *
 * Every combination is checked with `strict`, `exactOptionalPropertyTypes`
 * and `skipLibCheck: false`, so errors inside our declarations count too.
 *
 * `--tsc <path to bin/tsc>` (repeatable) replaces the default compilers, e.g.
 * to find the oldest TypeScript that reads the declarations.
 */
import { execFile, execFileSync } from 'node:child_process';
import {
  copyFileSync,
  cpSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { availableParallelism, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const root = resolve(import.meta.dirname, '..');
const packagesDir = join(root, 'packages');
const fixturesDir = join(root, 'test', 'consumer');

const { values } = parseArgs({
  options: { tsc: { type: 'string', multiple: true } },
});

interface Compiler {
  label: string;
  bin: string;
  /** [major, minor] */
  version: [number, number];
  /** The @types/node to install with it, in the node_modules of the repository */
  typesNode: string;
}

const atLeast = (
  [major, minor]: [number, number],
  wantedMajor: number,
  wantedMinor: number,
) => major > wantedMajor || (major === wantedMajor && minor >= wantedMinor);

const compiler = (bin: string): Compiler => {
  const manifest = JSON.parse(
    readFileSync(join(dirname(dirname(bin)), 'package.json'), 'utf8'),
  );
  const [major, minor] = manifest.version.split('.').map(Number);
  return {
    label: `TS ${major}.${minor}`,
    bin,
    version: [major, minor],
    // DefinitelyTyped supports TypeScript versions for two years: the
    // current @types/node no longer reads under 5.0 (TS2502 in
    // web-globals/streams.d.ts). A user of 5.0 installs the last version
    // published for it, the `ts5.0` dist-tag of @types/node.
    typesNode: atLeast([major, minor], 5, 1)
      ? '@types/node'
      : 'types-node-ts5.0',
  };
};

const compilers = (
  values.tsc ?? [
    // 5.0 is the documented minimum.
    join(root, 'node_modules/typescript-5.0/bin/tsc'),
    join(root, 'node_modules/typescript/bin/tsc'),
    join(root, 'node_modules/@typescript/native/bin/tsc'),
  ]
).map((bin) => compiler(resolve(bin)));

interface Combination {
  name: string;
  files: string[];
  compilerOptions: Record<string, unknown>;
  /** Why the combination is not meant to type-check, if it is not. */
  skip?: (tsc: Compiler) => string | undefined;
}

const esm = ['esm.ts', 'react.tsx'];
const modes = [
  { name: 'node16', module: 'node16', moduleResolution: 'node16' },
  { name: 'nodenext', module: 'nodenext', moduleResolution: 'nodenext' },
  { name: 'bundler', module: 'esnext', moduleResolution: 'bundler' },
];

const combinations: Combination[] = [
  ...modes.map(({ name, ...options }) => ({
    name,
    files: esm,
    compilerOptions: { ...options, types: ['node'] },
  })),
  // The browser and deno builds of @ts-graphviz/adapter, picked by export
  // conditions; neither runtime has the types of Node.js.
  ...['browser', 'deno'].map((condition) => ({
    name: `bundler (${condition})`,
    files: esm,
    compilerOptions: {
      module: 'esnext',
      moduleResolution: 'bundler',
      customConditions: [condition],
      lib: ['ES2022', 'DOM'],
      types: [],
    },
  })),
  // The packages are ESM-only. A CommonJS module can only `require()` them
  // where TypeScript models Node.js's require(esm): `module: nodenext` since
  // TypeScript 5.8 and `module: node20` since 5.9. Elsewhere it is an error
  // (TS1471), rightly: under node16 because Node.js 16 had no require(esm);
  // bundler mode has no CommonJS files.
  ...(
    [
      ['nodenext', [5, 8]],
      ['node20', [5, 9]],
    ] as const
  ).map(([mode, [major, minor]]) => ({
    name: `${mode} (CommonJS)`,
    files: ['cjs.cts'],
    // moduleResolution follows module (node16 for node20)
    compilerOptions: { module: mode, types: ['node'] },
    skip: (tsc: Compiler) =>
      atLeast(tsc.version, major, minor)
        ? undefined
        : `${mode}'s require() of ES modules needs TypeScript >= ${major}.${minor}`,
  })),
];

const shared = {
  target: 'ES2022',
  strict: true,
  exactOptionalPropertyTypes: true,
  skipLibCheck: false,
  jsx: 'react-jsx',
  noEmit: true,
};

// pnpm is a `.cmd` shim on Windows, which needs a shell to run
const shell = process.platform === 'win32';
const temp = mkdtempSync(join(tmpdir(), 'ts-graphviz-consumer-'));

/** Pack the packages and extract the tarballs; gives the package directories. */
const pack = (): string[] => {
  const destination = join(temp, 'tarballs');
  const packages: string[] = [];
  for (const name of readdirSync(packagesDir)) {
    const dir = join(packagesDir, name);
    const manifest = JSON.parse(
      readFileSync(join(dir, 'package.json'), 'utf8'),
    );
    if (manifest.private) continue;
    const output = execFileSync(
      'pnpm',
      ['pack', '--pack-destination', destination, '--json'],
      { cwd: dir, encoding: 'utf8', shell },
    );
    const unpacked = join(temp, 'unpacked', name);
    mkdirSync(unpacked, { recursive: true });
    execFileSync('tar', ['-xzf', JSON.parse(output).filename, '-C', unpacked]);
    packages.push(join(unpacked, 'package'));
  }
  return packages;
};

/**
 * A consumer project: copies of the packages in its node_modules, so they
 * find each other as installed, and links to the packages of the repository
 * that the declarations reference.
 */
const createConsumer = (packages: string[], typesNode: string): string => {
  const project = join(temp, `consumer-${typesNode.replace('/', '+')}`);
  const modules = join(project, 'node_modules');
  for (const dir of packages) {
    const { name } = JSON.parse(
      readFileSync(join(dir, 'package.json'), 'utf8'),
    );
    cpSync(dir, join(modules, name), { recursive: true });
  }
  const links = {
    '@types/node': typesNode,
    '@types/react': '@types/react',
    react: 'react',
  };
  for (const [name, source] of Object.entries(links)) {
    mkdirSync(dirname(join(modules, name)), { recursive: true });
    symlinkSync(
      realpathSync(join(root, 'node_modules', source)),
      join(modules, name),
      'junction',
    );
  }
  writeFileSync(
    join(project, 'package.json'),
    JSON.stringify({ name: 'consumer', private: true, type: 'module' }),
  );
  for (const file of readdirSync(fixturesDir)) {
    copyFileSync(join(fixturesDir, file), join(project, file));
  }
  return project;
};

const check = (
  project: string,
  tsc: Compiler,
  combination: Combination,
  id: number,
): Promise<string | undefined> => {
  const config = join(project, `tsconfig.${id}.json`);
  writeFileSync(
    config,
    JSON.stringify({
      compilerOptions: { ...shared, ...combination.compilerOptions },
      files: combination.files,
    }),
  );
  return new Promise((done) => {
    execFile(
      process.execPath,
      [tsc.bin, '--project', config, '--pretty', 'false'],
      { cwd: project, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
      (error, stdout, stderr) =>
        done(error ? `${stdout}${stderr}`.trim() : undefined),
    );
  });
};

try {
  const packages = pack();
  const projects = new Map(
    [...new Set(compilers.map(({ typesNode }) => typesNode))].map(
      (typesNode) => [typesNode, createConsumer(packages, typesNode)],
    ),
  );
  const jobs = compilers.flatMap((tsc) =>
    combinations.map((combination) => ({
      tsc,
      combination,
      project: projects.get(tsc.typesNode) ?? '',
    })),
  );
  const results: (string | undefined)[] = new Array(jobs.length);
  let next = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const id = next++;
      const { tsc, combination, project } = jobs[id];
      if (combination.skip?.(tsc)) continue;
      results[id] = await check(project, tsc, combination, id);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(availableParallelism(), 4) }, worker),
  );

  let failures = 0;
  jobs.forEach(({ tsc, combination, project }, id) => {
    const title = `${tsc.label} ${combination.name}`;
    const skipped = combination.skip?.(tsc);
    if (skipped) {
      console.log(`${title}: skipped (${skipped})`);
    } else if (results[id] === undefined) {
      console.log(`${title}: ok`);
    } else {
      failures++;
      console.log(`${title}: FAILED`);
      console.log(results[id]?.replaceAll(project, '<consumer>'));
    }
  });
  if (failures > 0) {
    console.error(`\n${failures} combination(s) failed.`);
    process.exitCode = 1;
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}
