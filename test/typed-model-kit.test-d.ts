import type {
  DSL,
  EdgeModel,
  ModelKit,
  NodeModel,
  RootGraphModel,
  SubgraphModel,
} from 'ts-graphviz';
import {
  createModelKit,
  Digraph,
  digraph,
  dsl,
  Edge,
  fromDot,
  fromDotAll,
  modelOf,
  Node,
  Subgraph,
  withModelKit,
} from 'ts-graphviz';
import { describe, expectTypeOf, it } from 'vitest';

// The classes of a ModelKit show in the types of what graphs create,
// in subgraphs too (#1736).

class MyNode extends Node {
  extra(): string {
    return this.id;
  }
}

class MyEdge extends Edge {
  weight(): number {
    return 1;
  }
}

describe('a ModelKit with custom classes', () => {
  const context = createModelKit({ Node: MyNode, Edge: MyEdge });

  it('is typed by its classes', () => {
    expectTypeOf(new context.Node('a')).toEqualTypeOf<MyNode>();
    expectTypeOf(context).toExtend<ModelKit>();
  });

  it('types what graph factories create, in subgraphs too', () => {
    const { digraph: myDigraph } = withModelKit({ Node: MyNode, Edge: MyEdge });
    myDigraph((g) => {
      expectTypeOf(g.node('a')).toEqualTypeOf<DSL<MyNode>>();
      expectTypeOf(g.edge(['a', 'b'])).toEqualTypeOf<DSL<MyEdge>>();
      expectTypeOf(modelOf(g).nodes).toEqualTypeOf<ReadonlyArray<MyNode>>();
      expectTypeOf(modelOf(g.node('a')).extra()).toEqualTypeOf<string>();
      expectTypeOf(
        modelOf(g.edge(['a', 'b'])).weight(),
      ).toEqualTypeOf<number>();
      g.node('b', (n) => {
        expectTypeOf(n).toEqualTypeOf<DSL<MyNode>>();
      });
      g.subgraph('s', (s) => {
        expectTypeOf(s.node('c')).toEqualTypeOf<DSL<MyNode>>();
        s.subgraph((t) => {
          expectTypeOf(t.edge(['c', 'd'])).toEqualTypeOf<DSL<MyEdge>>();
        });
      });
      expectTypeOf(modelOf(g).getNode('a')).toEqualTypeOf<MyNode | undefined>();
    });
  });

  it('types what fromDot and fromDotAll create', () => {
    const g = fromDot('digraph { a }', {
      convert: { models: { Node: MyNode } },
    });
    expectTypeOf(g.getNode('a')).toEqualTypeOf<MyNode | undefined>();
    const [first] = fromDotAll('digraph { a }', {
      convert: { models: { Node: MyNode } },
    });
    expectTypeOf(first.nodes).toEqualTypeOf<ReadonlyArray<MyNode>>();
  });

  it('keeps a custom subgraph class', () => {
    class MySubgraph extends Subgraph {
      tag(): string {
        return 'x';
      }
    }
    const { graph } = withModelKit({ Subgraph: MySubgraph });
    graph((g) => {
      expectTypeOf(g.subgraph('s')).toEqualTypeOf<DSL<MySubgraph>>();
      expectTypeOf(modelOf(g.subgraph('s')).tag()).toEqualTypeOf<string>();
    });
  });
});

describe('the members a class adds', () => {
  class Finder extends Digraph {
    find(id: string): NodeModel | undefined {
      return this.getNode(id);
    }
    accept(node: NodeModel, others: readonly NodeModel[]): number {
      return others.length + (node ? 1 : 0);
    }
    label(): string {
      return 'x';
    }
  }

  it('are on the model, not on the DSL', () => {
    const g = dsl(new Finder());
    expectTypeOf(modelOf(g).find('a')).toEqualTypeOf<NodeModel | undefined>();
    // @ts-expect-error the DSL has only DOT's words
    g.find('a');
    // On the DSL, `label` is the attribute.
    expectTypeOf(g.label).not.toEqualTypeOf<() => string>();
  });
});

describe('without custom classes', () => {
  it('keeps the base types', () => {
    digraph((g) => {
      expectTypeOf(g.node('a')).toEqualTypeOf<DSL<NodeModel>>();
      expectTypeOf(g.edge(['a', 'b'])).toEqualTypeOf<DSL<EdgeModel>>();
      expectTypeOf(g.subgraph('s')).toEqualTypeOf<DSL<SubgraphModel>>();
    });
    expectTypeOf(fromDot('digraph { a }')).toEqualTypeOf<RootGraphModel>();
  });
});
