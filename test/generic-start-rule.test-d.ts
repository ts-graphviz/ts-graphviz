import {
  type AttributeASTNode,
  type ClusterStatementASTNode,
  type DotASTNode,
  type EdgeASTNode,
  type NodeASTNode,
  type ParseOptions,
  type ParseResultByRule,
  parse,
  type Rule,
} from '@ts-graphviz/ast';
import {
  type EdgeModel,
  type FromDotOptions,
  fromDot,
  Node,
  type NodeModel,
  type RootGraphModel,
  type SubgraphModel,
} from 'ts-graphviz';
import { describe, expectTypeOf, it } from 'vitest';

// One generic signature per function, so a union rule works.
describe('parse', () => {
  it('returns the node of each rule', () => {
    expectTypeOf(
      parse('digraph {}', { as: 'Dot' }),
    ).toEqualTypeOf<DotASTNode>();
    expectTypeOf(parse('a', { as: 'Node' })).toEqualTypeOf<NodeASTNode>();
    expectTypeOf(
      parse('a=b', { as: 'Attribute' }),
    ).toEqualTypeOf<AttributeASTNode>();
    expectTypeOf(parse('a; b', { as: 'ClusterStatements' })).toEqualTypeOf<
      ClusterStatementASTNode[]
    >();
  });

  it('returns the union of the nodes for a union of rules', () => {
    const rule = Math.random() > 0.5 ? ('Node' as const) : ('Edge' as const);
    expectTypeOf(parse('a', { as: rule })).toEqualTypeOf<
      NodeASTNode | EdgeASTNode
    >();
    const anyRule = 'Dot' as Rule;
    expectTypeOf(parse('a', { as: anyRule })).toEqualTypeOf<
      ParseResultByRule[Rule]
    >();
  });

  it('gives a whole DOT source without as', () => {
    expectTypeOf(parse('digraph {}')).toEqualTypeOf<DotASTNode>();
    expectTypeOf(
      parse('digraph {}', { maxASTNodes: 100 }),
    ).toEqualTypeOf<DotASTNode>();
    expectTypeOf(
      parse('digraph {}', { as: undefined, maxASTNodes: 100 }),
    ).toEqualTypeOf<DotASTNode>();
  });

  it('gives a whole DOT source for ParseOptions<"Dot">', () => {
    const options: ParseOptions<'Dot'> = {};
    expectTypeOf(parse('digraph {}', options)).toEqualTypeOf<DotASTNode>();
  });

  it('gives the union for options whose rule is not known', () => {
    const options: ParseOptions = { as: 'Node' };
    expectTypeOf(parse('a', options)).toEqualTypeOf<ParseResultByRule[Rule]>();
  });

  it('needs as for a result other than a whole DOT source', () => {
    // @ts-expect-error the result would be a DotASTNode
    parse<'Edge'>('digraph {}');
    // @ts-expect-error the result would be a DotASTNode
    parse<'Edge'>('digraph {}', { maxASTNodes: 100 });
  });

  it('types the deprecated startRule as as', () => {
    expectTypeOf(
      parse('a -> b', { startRule: 'Edge' }),
    ).toEqualTypeOf<EdgeASTNode>();
    expectTypeOf(
      fromDot('a', { parse: { startRule: 'Node' } }),
    ).toEqualTypeOf<NodeModel>();
    expectTypeOf(
      parse('digraph {}', { startRule: undefined }),
    ).toEqualTypeOf<DotASTNode>();
  });

  it('types the result by as when startRule is given too', () => {
    expectTypeOf(
      parse('a', { as: 'Node', startRule: 'Edge' }),
    ).toEqualTypeOf<NodeASTNode>();
  });

  it('still rejects what is not a rule', () => {
    // @ts-expect-error not a rule
    parse('a', { as: 'Comment' });
    // @ts-expect-error a plain string is not a rule
    parse('a', { as: 'Node' as string });
  });
});

describe('fromDot', () => {
  it('keeps the types of single rules', () => {
    expectTypeOf(fromDot('digraph {}')).toEqualTypeOf<RootGraphModel>();
    expectTypeOf(
      fromDot('a', { parse: { as: 'Node' } }),
    ).toEqualTypeOf<NodeModel>();
    expectTypeOf(
      fromDot('a -> b', { parse: { as: 'Edge' } }),
    ).toEqualTypeOf<EdgeModel>();
    expectTypeOf(
      fromDot('subgraph {}', { parse: { as: 'Subgraph' } }),
    ).toEqualTypeOf<SubgraphModel>();
    expectTypeOf(
      fromDot('graph {}', { parse: { as: 'Graph' } }),
    ).toEqualTypeOf<RootGraphModel>();
  });

  it('returns the union of the models for a union of rules', () => {
    const rule = Math.random() > 0.5 ? ('Node' as const) : ('Edge' as const);
    expectTypeOf(fromDot('a', { parse: { as: rule } })).toEqualTypeOf<
      NodeModel | EdgeModel
    >();
  });

  it('combines a rule with custom model classes', () => {
    class MyNode extends Node {
      readonly mine = true;
    }
    const node = fromDot('a', {
      parse: { as: 'Node' },
      convert: { models: { Node: MyNode } },
    });
    expectTypeOf(node).toEqualTypeOf<MyNode>();
  });

  it('keeps an explicit models type argument working', () => {
    class MyNode extends Node {
      readonly mine = true;
    }
    const g = fromDot<{ Node: typeof MyNode }>('digraph { a }', {
      convert: { models: { Node: MyNode } },
    });
    expectTypeOf(g.createNode('a')).toEqualTypeOf<MyNode>();
  });

  it('does not let a type argument claim a rule the call does not use', () => {
    // @ts-expect-error parsed with 'Dot', so it is not a node
    fromDot<'Node'>('digraph {}');
  });

  it('accepts options held in a variable', () => {
    const options: FromDotOptions<'Node'> = { parse: { as: 'Node' } };
    expectTypeOf(fromDot('a', options)).toEqualTypeOf<NodeModel>();
    expectTypeOf(fromDot('digraph {}', {})).toEqualTypeOf<RootGraphModel>();
  });

  it('rejects rules it cannot convert', () => {
    // @ts-expect-error an attribute is not a model
    fromDot('a=b', { parse: { as: 'Attribute' } });
  });
});
