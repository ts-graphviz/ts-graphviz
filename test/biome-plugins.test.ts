/**
 * The GritQL plugins in tools/biome-plugins (enabled for the packages'
 * sources in biome.json) report what they are meant to, and nothing else,
 * on the fixtures next to them.
 */
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const fixtures = fileURLToPath(
  new URL('../tools/biome-plugins/fixtures/', import.meta.url),
);
const biome = createRequire(import.meta.url).resolve(
  '@biomejs/biome/bin/biome',
);

function lint(): { path: string; line: number }[] {
  let out: string;
  try {
    out = execFileSync(
      process.execPath,
      [biome, 'lint', '--reporter=json', '.'],
      {
        cwd: fixtures,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
        timeout: 60_000,
      },
    );
  } catch (e) {
    // Biome exits non-zero when it reports errors.
    out = (e as { stdout: string }).stdout;
  }
  const report = JSON.parse(out) as {
    diagnostics: {
      category: string;
      location: { path: string; start: { line: number } };
    }[];
  };
  return report.diagnostics
    .filter((d) => d.category === 'plugin')
    .map((d) => ({ path: d.location.path, line: d.location.start.line }));
}

// Runs the Biome binary: a `process` test (left out of `pnpm test`).
describe('Biome plugins for option and runtime reads', {
  tags: ['process'],
}, () => {
  it('report each case in bad.ts and nothing in good.ts', () => {
    const found = lint();
    expect(found.filter((d) => d.path === 'good.ts')).toStrictEqual([]);
    expect(
      found
        .filter((d) => d.path === 'bad.ts')
        .map((d) => d.line)
        .sort((a, b) => a - b),
    ).toStrictEqual([
      9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 24, 31,
    ]);
  });
});
