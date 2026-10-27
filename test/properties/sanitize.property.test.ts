import fc from 'fast-check';
import type { AttributeKey } from 'ts-graphviz';
import {
  createElementFactory,
  type DotASTNode,
  type LiteralASTNode,
  parse,
  sanitize,
  stringify,
} from 'ts-graphviz/ast';
import { describe, expect, it } from 'vitest';
import { dot } from './ast-arbitraries.js';

// Properties of sanitize (#1681): it never changes what it accepts, and it
// rejects a dangerous attribute wherever it is placed and however it is
// spelled. A failing run prints its seed; reproduce it with FC_SEED=<seed>.

const createElement = createElementFactory({ maxASTNodes: 0 });

function isUnsafeDotError(e: unknown): boolean {
  return (
    e instanceof DOMException &&
    e.name === 'SecurityError' &&
    (e as { code?: unknown }).code === 'TSG_ERR_UNSAFE_DOT'
  );
}

/** A name in any mix of upper and lower case. */
const anyCase = (name: string) =>
  fc
    .array(fc.boolean(), { minLength: name.length, maxLength: name.length })
    .map((upper) =>
      [...name].map((c, i) => (upper[i] ? c.toUpperCase() : c)).join(''),
    );

const literal = (value: string, quoted: boolean) =>
  createElement('Literal', { value, kind: quoted ? 'quoted' : 'bare' }, []);
// Any ID is a key in the syntax; the AST types name the known keys.
const key = (value: string, quoted: boolean) =>
  literal(value, quoted) as LiteralASTNode<AttributeKey>;

const fileAttribute = fc
  .tuple(
    fc
      .constantFrom('image', 'shapefile', 'imagepath', 'fontpath', 'stylesheet')
      .chain(anyCase),
    fc.boolean(),
  )
  .map(([name, quoted]) =>
    createElement(
      'Attribute',
      { key: key(name, quoted), value: literal('/etc/passwd', true) },
      [],
    ),
  );

const unsafeUrlAttribute = fc
  .tuple(
    fc
      .constantFrom('URL', 'href', 'edgeURL', 'headhref', 'tailURL', 'labelURL')
      .chain(anyCase),
    fc.constantFrom(
      'javascript:alert(1)',
      ' JavaScript:alert(1)',
      'java\tscript:alert(1)',
      'javascript&#58;alert(1)',
      'javascript&#x3A;alert(1)',
      'javascript&colon;alert(1)',
      'data:text/html,x',
      '\\N',
    ),
  )
  .map(([name, value]) =>
    createElement(
      'Attribute',
      { key: key(name, false), value: literal(value, true) },
      [],
    ),
  );

/** A generated DOT file with one dangerous attribute put into a graph or statement. */
const unsafeDot: fc.Arbitrary<DotASTNode> = fc
  .tuple(dot, fc.oneof(fileAttribute, unsafeUrlAttribute), fc.nat())
  .map(([ast, attribute, at]) => {
    // Graphs, subgraphs, nodes, edges and attribute lists all take attributes.
    const holders: { children: unknown[] }[] = [];
    const visit = (node: { type: string; children?: unknown[] }) => {
      if (node.type !== 'Dot' && node.type !== 'Comment' && node.children) {
        holders.push(node as { children: unknown[] });
      }
      for (const child of node.children ?? []) {
        visit(child as { type: string; children?: unknown[] });
      }
    };
    visit(ast);
    const holder = holders[at % holders.length];
    holder.children.splice(at % (holder.children.length + 1), 0, attribute);
    return ast;
  });

describe('sanitize', { tags: ['SM-7'] }, () => {
  it('returns DOT that parses to the same AST, or rejects it as unsafe', () => {
    fc.assert(
      fc.property(dot, (ast) => {
        const source = stringify(ast);
        let checked: string;
        try {
          checked = sanitize(source, { maxASTNodes: 0 });
        } catch (e) {
          expect(isUnsafeDotError(e)).toBe(true);
          return;
        }
        expect(stringify(parse(checked, { maxASTNodes: 0 }))).toBe(
          stringify(parse(source, { maxASTNodes: 0 })),
        );
        expect(sanitize(checked, { maxASTNodes: 0 })).toBe(checked);
      }),
    );
  });

  it('rejects a file-reading attribute or an unsafe link wherever it is', () => {
    fc.assert(
      fc.property(unsafeDot, (ast) => {
        expect(() => sanitize(stringify(ast), { maxASTNodes: 0 })).toThrow(
          expect.objectContaining({ code: 'TSG_ERR_UNSAFE_DOT' }),
        );
      }),
    );
  });
});
