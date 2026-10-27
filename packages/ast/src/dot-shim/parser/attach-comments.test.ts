import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { ASTNode } from '../../types.js';
import { parse as _parse } from './_parse.js';
import { attachComments, type InlineComment } from './attach-comments.js';
import { attachCommentsReference } from './attach-comments.reference.js';
import { DotSyntaxError, parse } from './parse.js';

/** The AST of `dot` with the comments read inside statements, unattached. */
function unattached(dot: string): [ASTNode, InlineComment[]] {
  const inlineComments = new Map<number, InlineComment>();
  const ast = _parse(dot, { startRule: 'Dot', inlineComments }) as ASTNode;
  return [ast, [...inlineComments.values()]];
}

// DOT sources whose tokens are separated by spaces, line breaks and
// comments, so that comments land before, between and after every kind of
// node, in headers, attribute lists, edge chains and subgraphs.
const statement = fc.constantFrom(
  ['a'],
  ['a', '->', 'b'],
  ['a', '->', 'b', '->', 'c'],
  ['a', '->', '{', 'b', 'c', '}'],
  ['a', '[', 'color', '=', 'red', ',', 'label', '=', '"x"', ']'],
  ['node', '[', 'shape', '=', 'box', ']'],
  ['x', '=', 'y'],
  ['subgraph', 's', '{', 'b', ';', 'c', '->', 'd', '}'],
  ['a', ':', 'p', ':', 'n', '->', 'b'],
);
const separator = fc.oneof(
  { weight: 3, arbitrary: fc.constantFrom(' ', '\n') },
  {
    weight: 2,
    arbitrary: fc.constantFrom(
      ' /* c */ ',
      '/* c */',
      ' // c\n',
      '\n/* c */\n',
    ),
  },
);
const source = fc
  .array(statement, { minLength: 1, maxLength: 6 })
  .map((statements) => [
    'digraph',
    'G',
    '{',
    ...statements.flatMap((s) => [...s, ';']),
    '}',
  ])
  .chain((tokens) =>
    fc
      .array(separator, {
        minLength: tokens.length - 1,
        maxLength: tokens.length - 1,
      })
      .map((seps) => tokens.map((t, i) => (i ? seps[i - 1] : '') + t).join('')),
  );

describe('attachComments', { tags: ['SM-1'] }, () => {
  it('attaches every comment where the quadratic implementation did', () => {
    // Measured over 5 seeds × 300 sources: all distinct, all parse, about
    // 7.5 comments inside statements each (none in 1%), 6.5 of them within
    // a statement rather than between statements or in the graph header.
    fc.assert(
      fc.property(source, (dot) => {
        const [actual, comments] = unattached(dot);
        const [expected, sameComments] = unattached(dot);
        attachComments(actual, comments);
        attachCommentsReference(expected, sameComments);
        expect(actual).toStrictEqual(expected);
      }),
      { numRuns: 300 },
    );
  });

  it('attaches comments outside the root to the root', () => {
    const at = (offset: number) => ({ offset, line: 1, column: offset + 1 });
    const range = (start: number, end: number) => ({
      start: at(start),
      end: at(end),
    });
    const root = () =>
      ({ type: 'Dot', location: range(10, 100), children: [] }) as ASTNode;
    const comments: InlineComment[] = [
      { kind: 'Block', value: 'before', location: range(0, 5) },
      { kind: 'Block', value: 'inside', location: range(20, 25) },
      { kind: 'Block', value: 'after', location: range(110, 115) },
    ];
    const [actual, expected] = [root(), root()];
    let attached = 0;
    attachComments(actual, comments, () => attached++);
    attachCommentsReference(expected, comments);
    expect(actual).toStrictEqual(expected);
    expect(attached).toBe(3);
  });

  it('takes linear time in the number of comments', () => {
    // 1.8 s for 8000 such edges with the quadratic implementation. The
    // bound is on growth, not on wall-clock time, which coverage and a busy
    // machine stretch: four times the comments must take well under the
    // sixteen times a quadratic implementation takes. Each size keeps its
    // fastest of three runs.
    const time = (edges: number) => {
      const dot = `digraph { ${'a -> /* c */ b;'.repeat(edges)} }`;
      let best = Number.POSITIVE_INFINITY;
      for (let run = 0; run < 3; run++) {
        const start = performance.now();
        parse(dot, { maxASTNodes: 0 });
        best = Math.min(best, performance.now() - start);
      }
      return best;
    };
    time(1000); // warm up
    // About 4 here (with coverage and under load too); 11 for an
    // implementation that rescans a node's children for every comment.
    expect(time(20_000) / time(5000)).toBeLessThan(8);
  });

  it('attaches every comment in deeply nested subgraphs', () => {
    // Each comment is handed down level by level and attached once; the
    // depth stays within what the parser's own recursion takes everywhere
    // (and within the default nesting limit of #1777).
    const depth = 90;
    const dot = `digraph { ${'subgraph { a -> /* c */ b; '.repeat(depth)}${'}'.repeat(depth)} }`;
    const ast = parse(dot, { maxASTNodes: 0 });
    expect(JSON.stringify(ast).match(/"value":"c"/g)).toHaveLength(depth);
  });

  /** The smallest `maxASTNodes` that `dot` parses with. */
  function nodesOf(dot: string): number {
    for (let nodes = 1; ; nodes++) {
      try {
        parse(dot, { maxASTNodes: nodes });
        return nodes;
      } catch (e) {
        if (!(e instanceof DotSyntaxError)) throw e;
      }
    }
  }

  it('counts each comment once toward maxASTNodes', () => {
    // Inside statements: one node per comment.
    expect(nodesOf('digraph { a /* c */ -> /* d */ b }')).toBe(
      nodesOf('digraph { a -> b }') + 2,
    );
    // Comment statements, which the parser may first try inside a
    // statement: one node each, consecutive `//` lines merged into one.
    const plain = nodesOf('digraph {\na\n}');
    expect(nodesOf('digraph {\n/* x */\na\n}')).toBe(plain + 1);
    expect(nodesOf('digraph {\n// x\n// y\na\n}')).toBe(plain + 1);
  });
});
