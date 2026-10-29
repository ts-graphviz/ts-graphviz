/**
 * Reproducible-build check: the packed packages of a commit must be the same
 * bytes wherever and whenever they are built.
 *
 *   pnpm pack:check                     two clean clones of HEAD, built and
 *                                       packed, compared (what CI does)
 *   pnpm pack:check pack <dir>          pack every publishable package of
 *                                       this checkout into <dir>, with a
 *                                       SHA256SUMS file (run `pnpm build` first)
 *   pnpm pack:check compare <a> <b>     compare two such directories and
 *                                       explain the first difference of
 *                                       every tarball that differs
 *
 * `SOURCE_DATE_EPOCH` is set to the commit time of HEAD for the build and
 * the pack unless the caller sets it; nothing in the pipeline reads it
 * today, but a tool that does then stays deterministic. The local mode
 * clones HEAD, so uncommitted changes are not checked.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

// pnpm is a `.cmd` shim on Windows, which needs a shell to run
const shell = process.platform === 'win32';
const run = (command: string, args: string[], cwd: string) =>
  execFileSync(command, args, { cwd, stdio: 'inherit', shell });

const commitTime = (cwd: string) =>
  execFileSync('git', ['show', '-s', '--format=%ct', 'HEAD'], {
    cwd,
    encoding: 'utf8',
  }).trim();

const sha256 = (file: string) =>
  createHash('sha256').update(readFileSync(file)).digest('hex');

/** Files below `dir`, as relative paths, sorted. */
function walk(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((entry) => statSync(join(dir, entry)).isFile())
    .map((entry) => entry.replaceAll('\\', '/'))
    .sort();
}

function pack(destination: string): void {
  process.env.SOURCE_DATE_EPOCH ??= commitTime(root);
  mkdirSync(destination, { recursive: true });
  const packagesDir = join(root, 'packages');
  const lines: string[] = [];
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
    const tarball: string = JSON.parse(output).filename;
    lines.push(`${sha256(tarball)}  ${basename(tarball)}`);
  }
  // the `sha256sum -c` format, so the file is also usable by hand
  writeFileSync(join(destination, 'SHA256SUMS'), `${lines.join('\n')}\n`);
  console.log(lines.join('\n'));
}

/** Prints how two tarballs differ: entries, then the first differing line. */
function explain(a: string, b: string): void {
  const work = mkdtempSync(join(tmpdir(), 'ts-graphviz-pack-check-'));
  try {
    const dirs = { a: join(work, 'a'), b: join(work, 'b') };
    for (const [side, dir] of Object.entries(dirs)) {
      mkdirSync(dir);
      run('tar', ['-xzf', side === 'a' ? a : b, '-C', dir], work);
    }
    // entry order and metadata matter for the bytes even when the files match
    const listing = (file: string) =>
      execFileSync('tar', ['-tvf', file], { encoding: 'utf8' }).split('\n');
    const listA = listing(a);
    const listB = listing(b);
    if (listA.join('\n') !== listB.join('\n')) {
      console.log('  tar listings differ (entry order, size or metadata):');
      for (const line of listA)
        if (!listB.includes(line)) console.log(`  < ${line}`);
      for (const line of listB)
        if (!listA.includes(line)) console.log(`  > ${line}`);
    }
    const filesA = walk(dirs.a);
    const filesB = walk(dirs.b);
    for (const file of new Set([...filesA, ...filesB])) {
      if (!filesA.includes(file)) console.log(`  only in second: ${file}`);
      else if (!filesB.includes(file)) console.log(`  only in first: ${file}`);
      else {
        const linesA = readFileSync(join(dirs.a, file), 'latin1').split('\n');
        const linesB = readFileSync(join(dirs.b, file), 'latin1').split('\n');
        const n = Math.max(linesA.length, linesB.length);
        for (let i = 0; i < n; i++) {
          if (linesA[i] === linesB[i]) continue;
          console.log(`  ${file}:${i + 1} differs:`);
          console.log(`  < ${linesA[i] ?? '<end of file>'}`);
          console.log(`  > ${linesB[i] ?? '<end of file>'}`);
          break;
        }
      }
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

function compare(a: string, b: string): boolean {
  const tarballs = (dir: string) =>
    readdirSync(dir)
      .filter((name) => name.endsWith('.tgz'))
      .sort();
  const namesA = tarballs(a);
  const namesB = tarballs(b);
  let same = true;
  for (const name of new Set([...namesA, ...namesB])) {
    if (!namesA.includes(name) || !namesB.includes(name)) {
      console.log(`${name}: missing from ${namesA.includes(name) ? b : a}`);
      same = false;
      continue;
    }
    const hashA = sha256(join(a, name));
    const hashB = sha256(join(b, name));
    if (hashA === hashB) {
      console.log(`${name}: identical (${hashA})`);
      continue;
    }
    console.log(`${name}: DIFFERENT\n  ${hashA}\n  ${hashB}`);
    explain(join(a, name), join(b, name));
    same = false;
  }
  return same;
}

/** Builds and packs HEAD twice, from fresh clones, in a temporary directory. */
function local(): boolean {
  const work = mkdtempSync(join(tmpdir(), 'ts-graphviz-pack-check-'));
  const epoch = commitTime(root);
  try {
    const outputs: string[] = [];
    for (const round of ['first', 'second']) {
      const clone = join(work, round);
      const output = join(work, `${round}-tarballs`);
      console.log(`\n## ${round} build in ${relative(root, clone) || clone}`);
      run('git', ['clone', '--quiet', '--no-local', root, clone], work);
      run('git', ['checkout', '--quiet', 'HEAD'], clone);
      const env = { ...process.env, SOURCE_DATE_EPOCH: epoch };
      const sh = (command: string, args: string[]) =>
        execFileSync(command, args, {
          cwd: clone,
          stdio: 'inherit',
          shell,
          env,
        });
      sh('pnpm', ['install', '--frozen-lockfile', '--prefer-offline']);
      sh('pnpm', ['codegen']);
      sh('pnpm', ['build']);
      sh('node', [join('scripts', 'pack-check.ts'), 'pack', output]);
      outputs.push(output);
    }
    console.log('\n## comparison');
    return compare(outputs[0], outputs[1]);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

const [mode, ...args] = process.argv.slice(2);
if (mode === 'pack' && args.length === 1) {
  pack(resolve(args[0]));
} else if (mode === 'compare' && args.length === 2) {
  if (!compare(resolve(args[0]), resolve(args[1]))) {
    console.error(
      '\nThe packed packages differ: the build is not reproducible.',
    );
    process.exit(1);
  }
} else if (mode === undefined) {
  if (!local()) process.exit(1);
} else {
  console.error(
    'usage: pack-check.ts | pack-check.ts pack <dir> | pack-check.ts compare <a> <b>',
  );
  process.exit(2);
}
