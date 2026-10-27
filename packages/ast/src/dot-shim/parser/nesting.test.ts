import fc from 'fast-check';
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
  if (node.type === 'Edge') {
    for (const target of node.targets) {
      max = Math.max(max, depthOf(target as ASTNode, inner));
    }
  }
  return max;
}

describe('maxNestingDepth', { tags: ['SM-1'] }, () => {
  it('accepts nesting up to the limit (100 by default) and rejects deeper', () => {
    expect(() => parse(nested(100))).not.toThrow();
    let error: unknown;
    try {
      parse(nested(101));
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(DotSyntaxError);
    expect(error).toMatchObject({
      code: 'TSG_ERR_DOT_SYNTAX',
      location: { start: { offset: nested(101).lastIndexOf('{') } },
    });
    expect(() => parse(nested(3), { maxNestingDepth: 2 })).toThrow(
      DotSyntaxError,
    );
  });

  it('rejects nesting too deep for the parser with its own error', () => {
    // Before, a stack overflow inside the parser: TSG_ERR_PARSE_FAILED.
    let error: unknown;
    try {
      parse(nested(5000));
    } catch (e) {
      error = e;
    }
    // The block beyond the limit, not another syntax error.
    expect(error).toMatchObject({
      code: 'TSG_ERR_DOT_SYNTAX',
      location: { start: { offset: nested(101).lastIndexOf('{') } },
    });
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

  // Sources whose blocks nest in subgraphs, edge targets and braces inside
  // strings and comments.
  const block: fc.Arbitrary<string> = fc.letrec<{ block: string }>((tie) => ({
    block: fc
      .array(
        fc.oneof(
          { depthSize: 'small' },
          fc.constantFrom(
            'a;',
            'b [label="}{"];',
            '/* } */',
            '// {\n',
            'x=<{>;',
          ),
          tie('block').map((b) => `subgraph { ${b} }`),
          tie('block').map((b) => `a -> { ${b} };`),
        ),
        { minLength: 1, maxLength: 4 },
      )
      .map((items) => items.join(' ')),
  })).block;

  it('counts the nesting the parser builds', () => {
    // Measured over 5 seeds × 300 sources: about 92% distinct, none empty,
    // depths 1 to 9 (1 in 13%, 4 to 6 in 60%).
    fc.assert(
      fc.property(block, (body) => {
        const dot = `digraph { ${body} }`;
        const depth = depthOf(parse(dot, { maxNestingDepth: 1000 }));
        expect(deepBlockOffset(dot, depth)).toBe(-1);
        expect(deepBlockOffset(dot, depth - 1)).not.toBe(-1);
      }),
      { numRuns: 300 },
    );
  });
});
