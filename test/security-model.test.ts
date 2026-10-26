/**
 * Keeps the security model page of the website and the tests in sync without
 * the document naming test files. The guarantees are Vitest tags: each
 * `## SM-n. Title` section of the document is a tag (vitest.config.ts), and a
 * test that backs a guarantee carries it (`describe(name, { tags: ['SM-n'] },
 * …)`). Vitest rejects a tag that is not a section (strictTags); this checks
 * that every guarantee the document says is enforced by tests ("tests tagged
 * `SM-n`") has at least one such test.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');
const document = readFileSync(
  join(
    root,
    'website/docs/ts-graphviz/11-advanced-topics/06-security-model.md',
  ),
  'utf8',
);

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
const titlePrefixes: string[] = [];
for (const file of [
  ...testFiles(join(root, 'packages')),
  ...testFiles(join(root, 'test')),
]) {
  if (file.endsWith('security-model.test.ts')) continue;
  const source = readFileSync(file, 'utf8');
  for (const [, list] of source.matchAll(/\btags:\s*\[([^\]]*)\]/g)) {
    for (const [, id] of list.matchAll(/['"`](SM-\d+)['"`]/g)) {
      taggedIds.set(id, [...(taggedIds.get(id) ?? []), file]);
    }
  }
  if (/\(\s*['"`]\[SM-\d+\]/.test(source)) titlePrefixes.push(file);
}

describe('security model ↔ tests', () => {
  it('the document has identified sections and test-backed claims', () => {
    expect(sectionIds.size).toBeGreaterThan(0);
    expect(claimedIds.size).toBeGreaterThan(0);
    for (const id of claimedIds) expect(sectionIds).toContain(id);
  });

  it('every claim "tests tagged SM-n" has at least one test with that tag', () => {
    const missing = [...claimedIds].filter((id) => !taggedIds.has(id));
    expect(missing).toStrictEqual([]);
  });

  it('every SM-n tag names a section of the document', () => {
    const unknown = [...taggedIds.keys()].filter((id) => !sectionIds.has(id));
    expect(unknown).toStrictEqual([]);
  });

  it('guarantees are tags, not [SM-n] prefixes in test titles', () => {
    expect(titlePrefixes).toStrictEqual([]);
  });
});
