import {
  type AttributeASTNode,
  type ClusterStatementASTNode,
  type DotASTNode,
  type EdgeASTNode,
  type FragmentByRule,
  type NodeASTNode,
  parseFragment,
  type Rule,
} from '@ts-graphviz/ast';
import {
  type EdgeModel,
  fromDot,
  Node,
  type NodeModel,
  type RootGraphModel,
  type SubgraphModel,
} from 'ts-graphviz';
import { describe, expectTypeOf, it } from 'vitest';

// #1741: one generic signature per function, so a union rule works.
describe('parseFragment', () => {
  it('returns the node of each rule', () => {
    expectTypeOf(
      parseFragment('digraph {}', 'Dot'),
    ).toEqualTypeOf<DotASTNode>();
    expectTypeOf(parseFragment('a', 'Node')).toEqualTypeOf<NodeASTNode>();
    expectTypeOf(
      parseFragment('a=b', 'Attribute'),
    ).toEqualTypeOf<AttributeASTNode>();
    expectTypeOf(parseFragment('a; b', 'ClusterStatements')).toEqualTypeOf<
      ClusterStatementASTNode[]
    >();
  });

  it('returns the union of the nodes for a union of rules', () => {
    const rule = Math.random() > 0.5 ? ('Node' as const) : ('Edge' as const);
    expectTypeOf(parseFragment('a', rule)).toEqualTypeOf<
      NodeASTNode | EdgeASTNode
    >();
    const anyRule = 'Dot' as Rule;
    expectTypeOf(parseFragment('a', anyRule)).toEqualTypeOf<
      FragmentByRule[Rule]
    >();
  });

  it('still rejects what is not a rule', () => {
    // @ts-expect-error not a rule
    parseFragment('a', 'Comment');
    // @ts-expect-error a plain string is not a rule
    parseFragment('a', 'Node' as string);
  });
});

describe('fromDot', () => {
  it('keeps the types of single rules', () => {
    expectTypeOf(fromDot('digraph {}')).toEqualTypeOf<RootGraphModel>();
    expectTypeOf(
      fromDot('a', { parse: { startRule: 'Node' } }),
    ).toEqualTypeOf<NodeModel>();
    expectTypeOf(
      fromDot('a -> b', { parse: { startRule: 'Edge' } }),
    ).toEqualTypeOf<EdgeModel>();
    expectTypeOf(
      fromDot('subgraph {}', { parse: { startRule: 'Subgraph' } }),
    ).toEqualTypeOf<SubgraphModel>();
    expectTypeOf(
      fromDot('graph {}', { parse: { startRule: 'Graph' } }),
    ).toEqualTypeOf<RootGraphModel>();
  });

  it('returns the union of the models for a union of rules', () => {
    const rule = Math.random() > 0.5 ? ('Node' as const) : ('Edge' as const);
    expectTypeOf(fromDot('a', { parse: { startRule: rule } })).toEqualTypeOf<
      NodeModel | EdgeModel
    >();
  });

  it('combines a rule with custom model classes', () => {
    class MyNode extends Node {
      readonly mine = true;
    }
    const node = fromDot('a', {
      parse: { startRule: 'Node' },
      convert: { models: { Node: MyNode } },
    });
    expectTypeOf(node).toEqualTypeOf<MyNode>();
  });

  it('rejects rules it cannot convert', () => {
    // @ts-expect-error an attribute is not a model
    fromDot('a=b', { parse: { startRule: 'Attribute' } });
  });
});
