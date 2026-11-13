import { describe, expect, it } from 'vitest';
import { fromDot } from './from-dot.js';

describe('fromDot with a rule that has no model', () => {
  it.each([
    ['Attribute', 'a = b'],
    ['AttributeList', 'node [a = b]'],
    ['ClusterStatements', 'a; b'],
  ])('rejects %s with TSG_ERR_UNCONVERTIBLE_AST', (startRule, dot) => {
    expect(() =>
      // JavaScript callers can pass any rule; the types allow only the
      // rules that have a model.
      fromDot(dot, { parse: { as: startRule as 'Dot' } }),
    ).toThrow(
      expect.objectContaining({
        name: 'TypeError',
        code: 'TSG_ERR_UNCONVERTIBLE_AST',
      }),
    );
  });
});

describe('fromDot with an empty subgraph as an edge endpoint', () => {
  it('reads the empty group DOT allows', () => {
    const G = fromDot('digraph { {} -> a }');
    expect(G.edges).toHaveLength(1);
    expect(G.edges[0].targets[0]).toEqual([]);
  });
});
