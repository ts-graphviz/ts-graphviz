import { describe, expect, it } from 'vitest';
import type { ASTNode } from '../../types.js';
import { deepBlockOffset } from './nesting.js';
import { DotSyntaxError, parse } from './parse.js';

const nested = (depth: number) =>
  `digraph { ${'subgraph { a; '.repeat(depth - 1)}${'}'.repeat(depth - 1)} }`;

/** The deepest graph or subgraph body in an AST (a graph's own is 1). */
function depthOf(node: ASTNode, depth = 0): number {
  const inner =
    node.type === 'Graph' || node.type === 'Subgraph' ? depth + 1 : depth;
  let max = inner;
  const children = (node as { children?: ASTNode[] }).children ?? [];
  for (const child of children) max = Math.max(max, depthOf(child, inner));
  return max;
}

describe('maxNestingDepth', () => {
  it('accepts nesting up to the limit (100 by default) and rejects deeper', () => {
    expect(() => parse(nested(100))).not.toThrow();
    expect(() => parse(nested(101))).toThrow(DotSyntaxError);
    expect(() => parse(nested(101))).toThrow(/Nesting depth exceeds .* 100/);
    expect(() => parse(nested(3), { maxNestingDepth: 2 })).toThrow(
      DotSyntaxError,
    );
    expect(() => parse(nested(150), { maxNestingDepth: 200 })).not.toThrow();
  });

  it('rejects nesting too deep for the parser with its own error', () => {
    expect(() => parse(nested(5000))).toThrow(/Nesting depth exceeds/);
    expect(() =>
      parse(`digraph{${'{'.repeat(5000)}a${'}'.repeat(5000)}}`),
    ).toThrow(DotSyntaxError);
  });

  it('does not count braces in strings or comments', () => {
    const dot = [
      'digraph {',
      '  a [label="{{{{\\"{{"];',
      '  b [label=<<b>{{{{</b>>];',
      '  /* {{{{ */ // {{{{',
      '  # {{{{',
      '  c',
      '}',
    ].join('\n');
    expect(() => parse(dot, { maxNestingDepth: 1 })).not.toThrow();
  });

  it('ends a line comment where the parser does, at LF or CR', () => {
    // The braces after a lone CR are read by the parser, so they count.
    const dot = `digraph { // c\r${'subgraph { '.repeat(200)}${'}'.repeat(200)} }`;
    expect(() => parse(dot)).toThrow(/Nesting depth exceeds/);
  });

  // Every body of up to three items from these, nested up to three levels in
  // subgraphs and anonymous blocks, with braces inside strings and comments.
  const leaves = ['a;', 'b [label="}{"];', '/* } */', '// {\n', 'x=<{>;'];
  function bodies(level: number): string[] {
    const items =
      level === 0
        ? leaves
        : [
            ...leaves,
            ...bodies(level - 1).flatMap((b) => [
              `subgraph { ${b} }`,
              `{ ${b} }`,
            ]),
          ];
    return items.flatMap((x) => [x, `${x} ${items[0]}`]);
  }

  it('counts the nesting the parser builds', () => {
    const sources = bodies(3);
    expect(sources.length).toBeGreaterThan(100);
    for (const body of sources) {
      const dot = `digraph { ${body} }`;
      const depth = depthOf(parse(dot, { maxNestingDepth: 1000 }));
      expect(deepBlockOffset(dot, depth)).toBe(-1);
      expect(deepBlockOffset(dot, depth - 1)).not.toBe(-1);
    }
  });
});

describe('maxEdgeChainDepth', () => {
  it('reads long chains without using the stack, within the limit', () => {
    const chain = (n: number) => `digraph{a${'->a'.repeat(n)}}`;
    expect(() => parse(chain(1000))).not.toThrow();
    expect(() => parse(chain(1001))).toThrow(DotSyntaxError);
    expect(() =>
      parse(chain(50000), { maxEdgeChainDepth: 100000, maxASTNodes: 0 }),
    ).not.toThrow();
  });
});
