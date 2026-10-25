import { describe, expect, expectTypeOf, it } from 'vitest';
import type {
  ClusterStatementASTNode,
  EdgeASTNode,
  NodeASTNode,
} from '../../types.js';
import { DotSyntaxError, parse, parseFragment, type Rule } from './parse.js';

const fragments: [Rule, string][] = [
  ['Dot', 'digraph { a }'],
  ['Graph', 'graph G { a -- b }'],
  ['Subgraph', 'subgraph cluster_a { a }'],
  ['Node', 'a [color=red]'],
  ['Edge', 'a -> b [color=red]'],
  ['AttributeList', 'node [shape=box]'],
  ['Attribute', 'rankdir=LR'],
  ['ClusterStatements', 'a; b -> c; rank=same'],
];

describe('parseFragment', () => {
  it.each(fragments)(
    'reads a %s as parse with the deprecated startRule does',
    (rule, dot) => {
      expect(parseFragment(dot, rule)).toStrictEqual(
        parse(dot, { startRule: rule }),
      );
    },
  );

  it('types the result by rule', () => {
    expectTypeOf(parseFragment('a', 'Node')).toEqualTypeOf<NodeASTNode>();
    expectTypeOf(parseFragment('a -> b', 'Edge')).toEqualTypeOf<EdgeASTNode>();
    expectTypeOf(parseFragment('a', 'ClusterStatements')).toEqualTypeOf<
      ClusterStatementASTNode[]
    >();
  });

  it('applies the parser limits', () => {
    expect(() =>
      parseFragment('a; b; c', 'ClusterStatements', { maxASTNodes: 2 }),
    ).toThrow(DotSyntaxError);
  });

  it('rejects input that is not the fragment', () => {
    expect(() => parseFragment('digraph { a }', 'Edge')).toThrow(
      DotSyntaxError,
    );
  });
});
