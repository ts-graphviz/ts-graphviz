import type {
  EdgeModel,
  ModelsContext,
  NodeModel,
  RootGraphModel,
  SubgraphModel,
} from 'ts-graphviz';
import {
  createModelsContext,
  digraph,
  Edge,
  fromDot,
  fromDotAll,
  Node,
  Subgraph,
  withContext,
} from 'ts-graphviz';
import { describe, expectTypeOf, it } from 'vitest';

// The classes of a ModelsContext show in the types of what graphs create,
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

describe('a ModelsContext with custom classes', () => {
  const context = createModelsContext({ Node: MyNode, Edge: MyEdge });

  it('is typed by its classes', () => {
    expectTypeOf(new context.Node('a')).toEqualTypeOf<MyNode>();
    expectTypeOf(context).toExtend<ModelsContext>();
  });

  it('types what graph factories create, in subgraphs too', () => {
    const { digraph: myDigraph } = withContext({ Node: MyNode, Edge: MyEdge });
    myDigraph((g) => {
      expectTypeOf(g.node('a')).toEqualTypeOf<MyNode>();
      expectTypeOf(g.edge(['a', 'b'])).toEqualTypeOf<MyEdge>();
      expectTypeOf(g.nodes).toEqualTypeOf<ReadonlyArray<MyNode>>();
      g.node('b', (n) => {
        expectTypeOf(n).toEqualTypeOf<MyNode>();
      });
      g.subgraph('s', (s) => {
        expectTypeOf(s.node('c')).toEqualTypeOf<MyNode>();
        s.subgraph((t) => {
          expectTypeOf(t.edge(['c', 'd'])).toEqualTypeOf<MyEdge>();
        });
      });
      expectTypeOf(g.getNode('a')).toEqualTypeOf<MyNode | undefined>();
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
    const { graph } = withContext({ Subgraph: MySubgraph });
    graph((g) => {
      expectTypeOf(g.subgraph('s')).toEqualTypeOf<MySubgraph>();
    });
  });
});

describe('without custom classes', () => {
  it('keeps the base types', () => {
    digraph((g) => {
      expectTypeOf(g.node('a')).toEqualTypeOf<NodeModel>();
      expectTypeOf(g.edge(['a', 'b'])).toEqualTypeOf<EdgeModel>();
      expectTypeOf(g.subgraph('s')).toEqualTypeOf<SubgraphModel>();
    });
    expectTypeOf(fromDot('digraph { a }')).toEqualTypeOf<RootGraphModel>();
  });
});
