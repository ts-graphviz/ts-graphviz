/**
 * Tests that start a real process carry the `process` tag (vitest.config.ts):
 * `pnpm test` leaves them out, and `pnpm test:sandbox` runs them in a
 * container (scripts/test-sandbox.ts). This checks, file by file, that a test
 * file that can start a process has the tag somewhere, and that a file with
 * the tag can start one. test/process-guard.ts checks the same while the
 * tests run, test by test.
 *
 * A file can start a process when it uses `node:child_process`,
 * `Deno.Command`, a `dotCommand:` option, or the `toStream` / `toFile` of an
 * adapter that runs a command, unless it mocks what it would start: vi.mock
 * of `node:child_process`, of the adapter module or of the Node.js
 * `toStream` under it, or vi.stubGlobal of `Deno`.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');

/**
 * Files that look like they start a process and do not: each with the
 * reason. A file listed here must still look like one (or the entry goes).
 */
const notProcess: Record<string, string> = {
  'packages/adapter/src/create-command-and-args.test.ts':
    'builds the command and arguments from a dotCommand option; runs nothing',
  'test/properties/prototype-pollution.property.test.tsx':
    'dotCommand is a polluted Object.prototype key; builds the command only',
};

/** Modules whose `toStream` / `toFile` start a command. */
const adapterModules = [
  './to-stream.node.js',
  './to-file.node.js',
  './node.js',
  './deno.js',
  '@ts-graphviz/adapter',
  'ts-graphviz/adapter',
];

function testFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        /\.(test|spec)\.[cm]?[jt]sx?$/.test(entry.name) &&
        !entry.parentPath.includes('node_modules'),
    )
    .map((entry) => join(entry.parentPath, entry.name));
}

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
const mocks = (source: string, specifier: string) =>
  new RegExp(`\\bvi\\.(?:mock|doMock)\\(\\s*['"\`]${specifier}['"\`]`).test(
    source,
  );

/** What in `source` can start a process, if anything. */
function startsProcess(source: string): string[] {
  const reasons: string[] = [];
  const mocksChildProcess = mocks(source, '(?:node:)?child_process');
  if (
    /(?:from\s+|import\s+|import\(\s*|require\(\s*)['"`](?:node:)?child_process['"`]/.test(
      source,
    ) &&
    !mocksChildProcess
  ) {
    reasons.push('node:child_process');
  }
  const stubsDeno = /\bvi\.stubGlobal\(\s*['"`]Deno['"`]/.test(source);
  if (/\bDeno\.Command\b/.test(source) && !stubsDeno) {
    reasons.push('Deno.Command');
  }
  if (/\bdotCommand\s*:/.test(source)) reasons.push('a dotCommand option');
  for (const [, names, module] of source.matchAll(
    /import\s*\{([^}]*)\}\s*from\s*['"`]([^'"`]+)['"`]/g,
  )) {
    const mocked =
      module === './deno.js'
        ? stubsDeno
        : mocksChildProcess ||
          mocks(source, escape(module)) ||
          mocks(source, escape('./to-stream.node.js'));
    if (
      adapterModules.includes(module) &&
      /\b(?:toStream|toFile)\b/.test(names) &&
      !mocked
    ) {
      reasons.push(`toStream / toFile from ${module}`);
    }
  }
  return reasons;
}

const tagged = (source: string) =>
  /\btags:\s*\[[^\]]*['"`]process['"`]/.test(source);

const files = ['packages', 'test', 'media'].flatMap((dir) =>
  testFiles(join(root, dir))
    .filter((file) => !file.endsWith('process-tag.test.ts'))
    .map((file) => {
      const source = readFileSync(file, 'utf8');
      return {
        path: relative(root, file).split('\\').join('/'),
        reasons: startsProcess(source),
        tagged: tagged(source),
      };
    }),
);

describe('the process tag', () => {
  it('finds the test files', () => {
    expect(files.length).toBeGreaterThan(50);
    expect(files.filter((f) => f.tagged).length).toBeGreaterThan(0);
  });

  it('is on every test file that starts a process', () => {
    const untagged = files
      .filter((f) => f.reasons.length > 0 && !f.tagged && !notProcess[f.path])
      .map((f) => `${f.path} (${f.reasons.join(', ')})`);
    expect(untagged).toStrictEqual([]);
  });

  it('is only on test files that start a process', () => {
    const extra = files
      .filter((f) => f.tagged && f.reasons.length === 0)
      .map((f) => f.path);
    expect(extra).toStrictEqual([]);
  });

  it('lists as exceptions only files that look like they start one', () => {
    const stale = Object.keys(notProcess).filter((path) => {
      const file = files.find((f) => f.path === path);
      return file === undefined || file.reasons.length === 0 || file.tagged;
    });
    expect(stale).toStrictEqual([]);
  });
});
