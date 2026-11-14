import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// The deprecations below are marked in the types only (JSDoc
// `@deprecated`), so an editor shows them; this keeps the tags on the
// declarations they belong to. (Reading tags needs no compiler API: the
// declaration and the JSDoc right above it are matched as text.)

const root = join(import.meta.dirname, '..');

/** A `@deprecated` tag: at the start of a JSDoc line, not in its prose. */
const DEPRECATED_TAG = /^\s*(?:\/\*\*|\*)\s*@deprecated\b/m;
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

describe('deprecated until v5: the legacy models and APIs', () => {
  it.each([
    [
      'packages/common/src/models/models.ts',
      'readonly attributes: Readonly<GraphCommonAttributes<S>>;',
    ],
    [
      'packages/core/src/models/GraphBase.ts',
      'public readonly attributes: Readonly<GraphCommonAttributes<SchemaOf<M>>> =',
    ],
    ['packages/core/src/models/legacy.ts', 'export class LegacySubgraph<'],
    ['packages/core/src/models/legacy.ts', 'export class LegacyGraph<'],
    ['packages/core/src/models/legacy.ts', 'export class LegacyDigraph<'],
    ['packages/core/src/models/legacy.ts', 'export const legacyModels:'],
    ['packages/ts-graphviz/src/legacy.ts', 'export const digraph:'],
    ['packages/ts-graphviz/src/legacy.ts', 'export const graph:'],
    ['packages/ts-graphviz/src/legacy.ts', 'export const strict:'],
    ['packages/ts-graphviz/src/legacy.ts', 'export function withContext<'],
    ['packages/ast/src/dot-shim/parser/parse.ts', 'startRule?: T;'],
  ])('%s: %s', (path, declaration) => {
    expect(docAbove(read(path), declaration)).toMatch(DEPRECATED_TAG);
  });

  it('the overload of parse that takes startRule, and not the others', () => {
    const lines = read('packages/ast/src/dot-shim/parser/parse.ts').split('\n');
    const overloads = lines.flatMap((line, i) =>
      line.startsWith('export function parse') ? [i] : [],
    );
    // The last one is the implementation, which no caller sees.
    const tagged = overloads.slice(0, -1).map((at) => {
      const signature = lines.slice(at, at + 4).join('\n');
      const above = lines.slice(0, at).join('\n');
      const end = above.trimEnd();
      const doc = end.endsWith('*/') ? end.slice(end.lastIndexOf('/**')) : '';
      return [signature.includes('{ startRule: R;'), DEPRECATED_TAG.test(doc)];
    });
    expect(tagged).toContainEqual([true, true]);
    for (const [startRule, deprecated] of tagged) {
      expect(deprecated).toBe(startRule);
    }
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
        expect(doc, `${name} at line ${at + 1}`).toMatch(DEPRECATED_TAG);
      }
      expect(starts.length).toBeGreaterThan(2);
    }
  });
});

/** The JSDoc block above every line that starts with `prefix`. */
function docsAboveAll(source: string, prefix: string): string[] {
  const lines = source.split('\n');
  return lines.flatMap((line, at) => {
    if (!line.trimStart().startsWith(prefix)) return [];
    const above = lines.slice(0, at).join('\n');
    const doc = above.slice(above.lastIndexOf('/**'));
    return [doc.trimEnd().endsWith('*/') ? doc : ''];
  });
}

describe('deprecated until v5: the names that follow Map', () => {
  it.each([
    ['packages/common/src/models/models.ts', 'readonly size: number;'],
    [
      'packages/common/src/models/models.ts',
      'readonly values: ReadonlyArray<AttributeTuple<T, E>>;',
    ],
    [
      'packages/common/src/models/models.ts',
      'apply(attributes: AttributesObject<T, E>',
    ],
    [
      'packages/common/src/models/models.ts',
      'delete(key: SchemaAttributeKey<T, E>): void;',
    ],
    ['packages/common/src/models/models.ts', 'clear(): void;'],
    [
      'packages/common/src/models/models.ts',
      'readonly attributes: AttributesGroupModel<T, E>;',
    ],
    [
      'packages/common/src/models/models.ts',
      'export interface AttributesGroupModel<',
    ],
    ['packages/common/src/models/readonly-models.ts', 'readonly size: number;'],
    ['packages/common/src/models/readonly-models.ts', 'readonly values:'],
    ['packages/common/src/models/readonly-models.ts', 'get(key: string)'],
    [
      'packages/common/src/models/readonly-models.ts',
      'readonly attributes: ReadonlyAttributes;',
    ],
    ['packages/core/src/attributes/AttributesBase.ts', 'get size(): number'],
    ['packages/core/src/attributes/AttributesBase.ts', 'get values():'],
    ['packages/core/src/attributes/AttributesBase.ts', 'public delete('],
    ['packages/core/src/attributes/AttributesBase.ts', 'public apply('],
    ['packages/core/src/attributes/AttributesBase.ts', 'public clear(): void'],
    [
      'packages/core/src/attributes/AttributesGroup.ts',
      'export class AttributesGroup<',
    ],
    ['packages/core/src/models/Node.ts', 'public get attributes():'],
    ['packages/core/src/models/Edge.ts', 'public get attributes():'],
  ])('%s: %s', (path, declaration) => {
    expect(docAbove(read(path), declaration)).toMatch(DEPRECATED_TAG);
  });

  it.each([
    ['packages/common/src/models/models.ts', 'get<K extends'],
    ['packages/common/src/models/models.ts', 'set<K extends'],
    ['packages/core/src/attributes/AttributesBase.ts', 'public get<K extends'],
    ['packages/core/src/attributes/AttributesBase.ts', 'public set<K extends'],
  ])('every overload in %s: %s', (path, prefix) => {
    const docs = docsAboveAll(read(path), prefix);
    expect(docs.length).toBeGreaterThanOrEqual(3);
    for (const doc of docs) expect(doc).toMatch(DEPRECATED_TAG);
  });

  it.each([
    ['packages/common/src/models/models.ts', 'getAttribute<K extends'],
    ['packages/common/src/models/models.ts', 'setAttribute<K extends'],
    ['packages/core/src/attributes/AttributesBase.ts', 'public getAttribute<K'],
  ])('not the DOM names: %s: %s', (path, prefix) => {
    for (const doc of docsAboveAll(read(path), prefix)) {
      expect(doc).not.toMatch(DEPRECATED_TAG);
    }
  });
});

describe('deprecated until v5: comment', () => {
  it.each([
    ['packages/common/src/models/models.ts', 'comment?: string | undefined;'],
    ['packages/core/src/models/Node.ts', 'public get comment():'],
    ['packages/core/src/models/Edge.ts', 'public get comment():'],
    ['packages/core/src/models/GraphBase.ts', 'public get comment():'],
    ['packages/core/src/models/Dot.ts', 'public get comment():'],
    ['packages/core/src/attributes/AttributeList.ts', 'public get comment():'],
  ])('%s: %s', (path, declaration) => {
    expect(docAbove(read(path), declaration)).toMatch(DEPRECATED_TAG);
  });

  it('every comment of the read-only model types', () => {
    const docs = docsAboveAll(
      read('packages/common/src/models/readonly-models.ts'),
      'readonly comment?: string | undefined;',
    );
    expect(docs).toHaveLength(5);
    for (const doc of docs) expect(doc).toMatch(DEPRECATED_TAG);
  });
});
