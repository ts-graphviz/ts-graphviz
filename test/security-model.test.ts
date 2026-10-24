/**
 * Keeps docs/security-model.md and the tests in sync without the document
 * naming test files: every guarantee the document says is enforced by tests
 * ("tests tagged `SM-n`") must have at least one test whose title carries
 * `[SM-n]`, and every `[SM-n]` used in a test must be a section of the
 * document.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');
const document = readFileSync(join(root, 'docs/security-model.md'), 'utf8');

const sectionIds = new Set(
  [...document.matchAll(/^## (SM-\d+)\./gm)].map((m) => m[1]),
);
const claimedIds = new Set(
  [...document.matchAll(/\*\*Evidence\*\*: tests tagged `(SM-\d+)`/g)].map(
    (m) => m[1],
  ),
);

function testFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        /\.(test|spec)\.tsx?$/.test(entry.name) &&
        !entry.parentPath.includes('node_modules'),
    )
    .map((entry) => join(entry.parentPath, entry.name));
}

const taggedIds = new Map<string, string[]>();
for (const file of [
  ...testFiles(join(root, 'packages')),
  ...testFiles(join(root, 'test')),
]) {
  const source = readFileSync(file, 'utf8');
  for (const [, id] of source.matchAll(/\[(SM-\d+)\]/g)) {
    taggedIds.set(id, [...(taggedIds.get(id) ?? []), file]);
  }
}

describe('security model ↔ tests', () => {
  it('the document has identified sections and test-backed claims', () => {
    expect(sectionIds.size).toBeGreaterThan(0);
    expect(claimedIds.size).toBeGreaterThan(0);
    for (const id of claimedIds) expect(sectionIds).toContain(id);
  });

  it('every claim "tests tagged SM-n" has at least one tagged test', () => {
    const missing = [...claimedIds].filter((id) => !taggedIds.has(id));
    expect(missing).toStrictEqual([]);
  });

  it('every [SM-n] tag in a test names a section of the document', () => {
    const unknown = [...taggedIds.keys()].filter((id) => !sectionIds.has(id));
    expect(unknown).toStrictEqual([]);
  });
});
