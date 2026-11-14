import { digraph } from 'ts-graphviz';
import {
  type ASTNode,
  type AttributeListASTNode,
  type ClusterStatementASTNode,
  createElement,
  type DotASTNode,
  type EdgeASTNode,
  fromModel,
  type GraphASTNode,
  type NodeASTNode,
  parse,
  type SubgraphASTNode,
  sanitize,
  stringify,
  toModel,
} from 'ts-graphviz/ast';
import { describe, expectTypeOf, it } from 'vitest';

// What users of `ts-graphviz/ast` get from its overloads and inference.
// The declarations themselves are in api-reports/.

describe('parse', () => {
  it('parse gives a whole file', () => {
    expectTypeOf(parse('digraph {}')).toEqualTypeOf<DotASTNode>();
  });

  it('parse types the node by as', () => {
    expectTypeOf(parse('a', { as: 'Node' })).toEqualTypeOf<NodeASTNode>();
    expectTypeOf(parse('a -> b', { as: 'Edge' })).toEqualTypeOf<EdgeASTNode>();
    expectTypeOf(
      parse('graph {}', { as: 'Graph' }),
    ).toEqualTypeOf<GraphASTNode>();
    expectTypeOf(
      parse('subgraph {}', { as: 'Subgraph' }),
    ).toEqualTypeOf<SubgraphASTNode>();
    expectTypeOf(
      parse('node [a=1]', { as: 'AttributeList' }),
    ).toEqualTypeOf<AttributeListASTNode>();
    expectTypeOf(parse('a; b', { as: 'ClusterStatements' })).toEqualTypeOf<
      ClusterStatementASTNode[]
    >();
    // @ts-expect-error not a rule
    parse('a', { as: 'Statement' });
  });
});

describe('building and printing', () => {
  it('createElement types the node by its type', () => {
    const id = createElement('Literal', { value: 'a', kind: 'bare' }, []);
    expectTypeOf(
      createElement('Node', { id }, []),
    ).toEqualTypeOf<NodeASTNode>();
  });

  it('stringify takes any node; sanitize takes and gives text', () => {
    expectTypeOf(stringify).parameter(0).toEqualTypeOf<ASTNode>();
    expectTypeOf(stringify(parse('graph {}'))).toEqualTypeOf<string>();
    expectTypeOf(sanitize('graph {}')).toEqualTypeOf<string>();
  });

  it('fromModel and toModel convert by kind', () => {
    const g = digraph();
    expectTypeOf(fromModel(g)).toEqualTypeOf<GraphASTNode>();
    expectTypeOf(fromModel(g.node('a'))).toEqualTypeOf<NodeASTNode>();
    expectTypeOf(toModel).returns.not.toBeAny();
  });
});
