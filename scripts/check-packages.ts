/**
 * Pack every publishable workspace package the way `pnpm publish` would (so
 * `publishConfig` is applied) and run publint and arethetypeswrong on the
 * tarballs. Run with `pnpm check:packages` after `pnpm build`.
 *
 * - publint: package.json consistency (exports, files, types next to code).
 * - attw: whether each entry point resolves with types under node16 and
 *   bundler resolution. The packages are ESM-only on purpose, so
 *   `cjs-resolves-to-esm` is ignored; `node10` resolution is not checked
 *   until #1632 is decided.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const packagesDir = join(root, 'packages');
const destination = mkdtempSync(join(tmpdir(), 'ts-graphviz-pack-'));

// pnpm is a `.cmd` shim on Windows, which needs a shell to run
const shell = process.platform === 'win32';
const run = (command: string, args: string[], cwd = root) =>
  execFileSync(command, args, { cwd, stdio: 'inherit', shell });

try {
  const tarballs: string[] = [];
  for (const name of readdirSync(packagesDir)) {
    const dir = join(packagesDir, name);
    const manifest = JSON.parse(
      readFileSync(join(dir, 'package.json'), 'utf8'),
    );
    if (manifest.private) continue;
    const output = execFileSync(
      'pnpm',
      ['pack', '--pack-destination', destination, '--json'],
      {
        cwd: dir,
        encoding: 'utf8',
        shell,
      },
    );
    tarballs.push(JSON.parse(output).filename);
  }

  for (const tarball of tarballs) {
    console.log(`\n## ${tarball}`);
    run('pnpm', ['exec', 'publint', tarball, '--strict']);
    run('pnpm', [
      'exec',
      'attw',
      tarball,
      '--profile',
      'node16',
      '--ignore-rules',
      'cjs-resolves-to-esm',
    ]);
  }
} finally {
  rmSync(destination, { recursive: true, force: true });
}
