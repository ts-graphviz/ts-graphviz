import {
  attribute as _,
  type Attribute,
  type AttributeKey,
  type DotModel,
  digraph,
  type EdgeModel,
  fromDot,
  fromDotAll,
  graph,
  isNodeModel,
  type NodeModel,
  type RootGraphModel,
  type SubgraphModel,
  strict,
  toDot,
} from 'ts-graphviz';
import { describe, expectTypeOf, it } from 'vitest';

// What users of `ts-graphviz` get from its overloads and inference (#1744).
// The declarations themselves are in api-reports/.

describe('model factories', () => {
  it('return the graph and pass it to the callback', () => {
    expectTypeOf(digraph()).toEqualTypeOf<RootGraphModel>();
    expectTypeOf(graph('G')).toEqualTypeOf<RootGraphModel>();
    expectTypeOf(
      strict.digraph('G', { rankdir: 'LR' }),
    ).toEqualTypeOf<RootGraphModel>();
    digraph('G', (g) => expectTypeOf(g).toEqualTypeOf<RootGraphModel>());
    graph({ label: 'x' }, (g) =>
      expectTypeOf(g).toEqualTypeOf<RootGraphModel>(),
    );
  });

  it('type what graphs create, and their callbacks', () => {
    digraph((g) => {
      expectTypeOf(g.node('a')).toEqualTypeOf<NodeModel>();
      expectTypeOf(g.node('a', { color: 'red' })).toEqualTypeOf<NodeModel>();
      g.node('a', (n) => expectTypeOf(n).toEqualTypeOf<NodeModel>());
      expectTypeOf(g.edge(['a', 'b'])).toEqualTypeOf<EdgeModel>();
      expectTypeOf(
        g.edge(['a', 'b'], { color: 'red' }),
      ).toEqualTypeOf<EdgeModel>();
      expectTypeOf(g.subgraph('s')).toEqualTypeOf<SubgraphModel>();
      g.subgraph((s) => expectTypeOf(s).toEqualTypeOf<SubgraphModel>());
      expectTypeOf(g.getNode('a')).toEqualTypeOf<NodeModel | undefined>();
      expectTypeOf(g.nodes).toEqualTypeOf<ReadonlyArray<NodeModel>>();
    });
  });

  it('take edge targets as ids, models, ports and groups', () => {
    digraph((g) => {
      const a = g.node('a');
      g.edge([a, 'b:p:n', { id: 'c', port: 'p' }, ['d', 'e']]);
      // @ts-expect-error an edge needs at least two targets
      g.edge(['a']);
    });
  });
});

describe('attributes', () => {
  it('type values by key', () => {
    digraph((g) => {
      g.set('rankdir', 'LR');
      g.set(_.label, 'x');
      expectTypeOf(g.get('rankdir')).toEqualTypeOf<
        Attribute<'rankdir'> | undefined
      >();
      // @ts-expect-error not a value of rankdir
      g.set('rankdir', 'XX');
      // @ts-expect-error not an attribute of graphs
      g.set('shape', 'box');
      g.node('a').attributes.set('shape', 'box');
      // @ts-expect-error not an attribute of nodes
      g.node('a').attributes.set('rankdir', 'LR');
    });
  });

  it('name keys through the attribute constants', () => {
    expectTypeOf(_.label).toEqualTypeOf<'label'>();
    expectTypeOf<'label'>().toExtend<AttributeKey>();
  });
});

describe('fromDot / fromDotAll / toDot', () => {
  it('type the model by the rule parsed', () => {
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
    expectTypeOf(fromDotAll('graph {} graph {}')).toEqualTypeOf<
      RootGraphModel[]
    >();
  });

  it('write any model', () => {
    expectTypeOf(toDot(digraph())).toEqualTypeOf<string>();
    for (const model of [digraph(), digraph().node('a')]) {
      expectTypeOf(toDot(model)).toEqualTypeOf<string>();
    }
    expectTypeOf<DotModel>().toExtend<Parameters<typeof toDot>[0]>();
  });

  it('narrow models with the guards', () => {
    const model: unknown = fromDot('digraph {}');
    if (isNodeModel(model)) expectTypeOf(model).toEqualTypeOf<NodeModel>();
  });
});
