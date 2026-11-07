import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// The deprecations of #1922 are marked in the types only (JSDoc
// `@deprecated`), so an editor shows them; this keeps the tags on the
// declarations they belong to. (Reading tags needs no compiler API: the
// declaration and the JSDoc right above it are matched as text.)

const root = join(import.meta.dirname, '..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');

/** The JSDoc block right above the first line that starts with `declaration`. */
function docAbove(source: string, declaration: string): string {
  const lines = source.split('\n');
  const at = lines.findIndex((line) =>
    line.trimStart().startsWith(declaration),
  );
  expect(at, `${declaration} not found`).toBeGreaterThan(0);
  let i = at - 1;
  while (i >= 0 && !lines[i].trimStart().startsWith('/**')) i--;
  const block = lines.slice(i, at).join('\n');
  expect(
    block.trimEnd().endsWith('*/'),
    `no JSDoc right above ${declaration}`,
  ).toBe(true);
  return block;
}

describe('deprecated until v5 (#1922)', () => {
  it.each([
    [
      'packages/common/src/models/models.ts',
      'readonly attributes: Readonly<GraphCommonAttributes<S>>;',
    ],
    [
      'packages/core/src/models/GraphBase.ts',
      'public readonly attributes: Readonly<GraphCommonAttributes<SchemaOf<M>>> =',
    ],
    ['packages/ts-graphviz/src/dsl.ts', 'readonly $attributes: {'],
    ['packages/core/src/models/legacy.ts', 'export class LegacySubgraph<'],
    ['packages/core/src/models/legacy.ts', 'export class LegacyGraph<'],
    ['packages/core/src/models/legacy.ts', 'export class LegacyDigraph<'],
    ['packages/core/src/models/legacy.ts', 'export const legacyModels:'],
    ['packages/ts-graphviz/src/legacy.ts', 'export const digraph:'],
    ['packages/ts-graphviz/src/legacy.ts', 'export const graph:'],
    ['packages/ts-graphviz/src/legacy.ts', 'export const strict:'],
    ['packages/ts-graphviz/src/legacy.ts', 'export function withContext<'],
  ])('%s: %s', (path, declaration) => {
    expect(docAbove(read(path), declaration)).toContain('@deprecated');
  });

  it('every overload of the legacy fromDot and fromDotAll', () => {
    const source = read('packages/ts-graphviz/src/legacy.ts');
    for (const name of ['fromDot', 'fromDotAll']) {
      const lines = source.split('\n');
      const starts = lines.flatMap((line, i) =>
        line.startsWith(`export function ${name}(`) ||
        line.startsWith(`export function ${name}<`)
          ? [i]
          : [],
      );
      // The last one is the implementation, which no caller sees.
      for (const at of starts.slice(0, -1)) {
        const above = lines.slice(0, at).join('\n');
        const doc = above.slice(above.lastIndexOf('/**'));
        expect(doc.trimEnd().endsWith('*/'), `${name} at line ${at + 1}`).toBe(
          true,
        );
        expect(doc, `${name} at line ${at + 1}`).toContain('@deprecated');
      }
      expect(starts.length).toBeGreaterThan(2);
    }
  });
});
