import {
  attribute as _,
  type Attribute,
  type AttributeKey,
  type DotModel,
  type DSL,
  digraph,
  type EdgeModel,
  fromDot,
  fromDotAll,
  type GraphCommonAttributes,
  graph,
  isNodeModel,
  modelOf,
  type NodeModel,
  type ReadonlyNodeModel,
  type RootGraphModel,
  type SubgraphModel,
  strict,
  toDot,
} from 'ts-graphviz';
import { describe, expectTypeOf, it } from 'vitest';

// What users of `ts-graphviz` get from its overloads and inference (#1744).
// The declarations themselves are in api-reports/.

describe('model factories', () => {
  it('return the graph’s DSL and pass it to the callback', () => {
    expectTypeOf(digraph()).toEqualTypeOf<DSL<RootGraphModel>>();
    expectTypeOf(graph('G')).toEqualTypeOf<DSL<RootGraphModel>>();
    expectTypeOf(strict.digraph('G', { rankdir: 'LR' })).toEqualTypeOf<
      DSL<RootGraphModel>
    >();
    digraph('G', (g) => expectTypeOf(g).toEqualTypeOf<DSL<RootGraphModel>>());
    graph({ label: 'x' }, (g) =>
      expectTypeOf(g).toEqualTypeOf<DSL<RootGraphModel>>(),
    );
    expectTypeOf(modelOf(digraph())).toEqualTypeOf<RootGraphModel>();
  });

  it('type what the statements create, and their callbacks', () => {
    digraph((g) => {
      expectTypeOf(g.node('a')).toEqualTypeOf<DSL<NodeModel>>();
      expectTypeOf(g.node('a', { color: 'red' })).toEqualTypeOf<
        DSL<NodeModel>
      >();
      g.node('a', (n) => expectTypeOf(n).toEqualTypeOf<DSL<NodeModel>>());
      expectTypeOf(g.node({ color: 'red' })).toEqualTypeOf<
        DSL<GraphCommonAttributes['node']>
      >();
      expectTypeOf(g.edge(['a', 'b'])).toEqualTypeOf<DSL<EdgeModel>>();
      expectTypeOf(g.edge(['a', 'b'], { color: 'red' })).toEqualTypeOf<
        DSL<EdgeModel>
      >();
      expectTypeOf(g.subgraph('s')).toEqualTypeOf<DSL<SubgraphModel>>();
      g.subgraph((s) => expectTypeOf(s).toEqualTypeOf<DSL<SubgraphModel>>());
    });
  });

  it('take edge targets as ids, models, DSLs, ports and groups', () => {
    digraph((g) => {
      const a = g.node('a');
      g.edge([a, 'b:p:n', { id: 'c', port: 'p' }, ['d', a], modelOf(a)]);
      g.edge([a.port('p'), a]);
      // @ts-expect-error an edge needs at least two targets
      g.edge(['a']);
    });
  });
});

describe('the model’s members are on the model', () => {
  it('give models', () => {
    digraph((g) => {
      const m = modelOf(g);
      expectTypeOf(m.getNodes('a')).toEqualTypeOf<NodeModel[]>();
      expectTypeOf(m.nodes).toEqualTypeOf<ReadonlyArray<NodeModel>>();
      expectTypeOf(m.subgraphs).toEqualTypeOf<ReadonlyArray<SubgraphModel>>();
      expectTypeOf(g.node({}).$$kind).toEqualTypeOf<'Node'>();
      expectTypeOf(g.$$type).toEqualTypeOf<'Graph'>();
      expectTypeOf(m.id).toEqualTypeOf<string | undefined>();
      expectTypeOf(modelOf(g.node('a')).id).toEqualTypeOf<string>();
    });
  });

  it('are not on the DSL', () => {
    digraph((g) => {
      // @ts-expect-error a model member: modelOf(g).nodes
      g.nodes;
      // @ts-expect-error a model member: modelOf(g).getNodes
      g.getNodes('a');
      // @ts-expect-error a model member: modelOf(g).createNode
      g.createNode('a');
      // @ts-expect-error a model member: modelOf(n).attributes
      g.node('a').attributes;
    });
  });
});

describe('attributes', () => {
  it('are properties typed by key', () => {
    digraph((g) => {
      expectTypeOf(g.rankdir).toEqualTypeOf<Attribute<'rankdir'> | undefined>();
      g.rankdir = 'LR';
      g[_.label] = 'x';
      g.rankdir = undefined;
      delete g.rankdir;
      // @ts-expect-error not a value of rankdir
      g.rankdir = 'XX';
      // @ts-expect-error not an attribute of graphs
      g.shape = 'box';
      const n = g.node('a');
      n.shape = 'box';
      // @ts-expect-error not an attribute of nodes
      n.rankdir = 'LR';
      expectTypeOf(n.id).toEqualTypeOf<Attribute<'id'> | undefined>();
      g.node({}).shape = 'box';
      // @ts-expect-error not an attribute of edges
      g.edge({}).shape = 'box';
    });
  });

  it('can also be set through the model', () => {
    digraph((g) => {
      modelOf(g).setAttribute('rankdir', 'LR');
      expectTypeOf(modelOf(g).getAttribute('rankdir')).toEqualTypeOf<
        Attribute<'rankdir'> | undefined
      >();
      // @ts-expect-error not a value of rankdir
      modelOf(g).setAttribute('rankdir', 'XX');
      modelOf(g.node('a')).setAttribute('shape', 'box');
      // @ts-expect-error not an attribute of nodes
      modelOf(g.node('a')).setAttribute('rankdir', 'LR');
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
      fromDot('a', { parse: { as: 'Node' } }),
    ).toEqualTypeOf<NodeModel>();
    expectTypeOf(
      fromDot('a -> b', { parse: { as: 'Edge' } }),
    ).toEqualTypeOf<EdgeModel>();
    expectTypeOf(
      fromDot('subgraph {}', { parse: { as: 'Subgraph' } }),
    ).toEqualTypeOf<SubgraphModel>();
    expectTypeOf(fromDotAll('graph {} graph {}')).toEqualTypeOf<
      RootGraphModel[]
    >();
  });

  it('write any model or DSL', () => {
    expectTypeOf(toDot(digraph())).toEqualTypeOf<string>();
    for (const model of [digraph(), digraph().node('a'), modelOf(digraph())]) {
      expectTypeOf(toDot(model)).toEqualTypeOf<string>();
    }
    expectTypeOf<DotModel>().toExtend<Parameters<typeof toDot>[0]>();
    expectTypeOf<DSL<DotModel>>().toExtend<Parameters<typeof toDot>[0]>();
  });

  it('narrow models with the guards', () => {
    // On unknown, to the read-only view: the check cannot tell more.
    const model: unknown = fromDot('digraph {}');
    if (isNodeModel(model)) {
      expectTypeOf(model).toEqualTypeOf<ReadonlyNodeModel>();
    }
    // Given a model, the caller's type is kept.
    const statement = modelOf(digraph()).statements[0];
    if (statement && isNodeModel(statement)) {
      expectTypeOf(statement).toEqualTypeOf<NodeModel>();
    }
    // A DSL is not a model; narrow DSLs by $$type.
    const view = digraph().node('a') as DSL<NodeModel> | DSL<EdgeModel>;
    expectTypeOf(isNodeModel(view)).toEqualTypeOf<boolean>();
    if (view.$$type === 'Node') {
      expectTypeOf(view).toEqualTypeOf<DSL<NodeModel>>();
    }
  });
});
