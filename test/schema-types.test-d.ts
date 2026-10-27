import type {
  Attribute,
  AttributeKey,
  AttributesEntities,
  AttributesObject,
  AttributeValueTypeNames,
  AttributeValueTypes,
  ClusterSubgraphAttributesObject,
  DotModel,
  EdgeAttributeKey,
  EdgeModel,
  EmptySchema,
  GraphAttributesObject,
  ModelsContext,
  ModelTypes,
  NodeAttributeKey,
  NodeAttributesObject,
  NodeModel,
  NonClusterSubgraphAttributesObject,
  RootGraphModel,
  Schema,
  SchemaAttributeTypes,
  SchemaEdgeModel,
  SchemaEntry,
  SchemaKind,
  SchemaModelTypes,
  SchemaNodeModel,
  SchemaRootGraphModel,
  SchemaSubgraphModel,
  SubgraphAttributesFor,
  SubgraphAttributesObject,
  SubgraphModel,
} from 'ts-graphviz';
import {
  createModelsContext,
  digraph,
  fromDot,
  fromDotAll,
  toDot,
  withContext,
} from 'ts-graphviz';
import { describe, expectTypeOf, it } from 'vitest';

// The type-level plumbing of schemas (#1841, phase 1): the schema is written
// by hand here, as `defineSchema` (phase 2) will produce it.

type Add<T> = SchemaEntry<T, 'add'>;
type Extend<T> = SchemaEntry<T, 'extend'>;
type Override<T> = SchemaEntry<T, 'override'>;

type MySchema = {
  types: {
    color: Extend<'brand-blue'>;
    style: Extend<'my-style'>;
    arrowType: Extend<'my-arrow'>;
    compass: Extend<'mid'>;
    rankdir: Override<'TB' | 'LR'>;
  };
  graph: { hoge: Add<string> };
  subgraph: { lane: Add<number> };
  cluster: { team: Add<'core' | 'infra'> };
  node: {
    'data-id': Add<number>;
    label: Override<number>;
    // A per-attribute entry wins over `types`.
    fontcolor: Override<'black' | 'white'>;
  };
  edge: { 'edge-only': Add<boolean>; dir: Extend<'sideways'> };
};

type MyTypes = SchemaModelTypes<MySchema>;

declare const ctx: ModelsContext<MyTypes>;

// A ModelTypes written by hand instead of SchemaModelTypes.
interface HandTypes extends ModelTypes {
  Schema: MySchema;
  Dot: DotModel;
  Graph: SchemaRootGraphModel<HandTypes>;
  Digraph: SchemaRootGraphModel<HandTypes>;
  Subgraph: SchemaSubgraphModel<HandTypes>;
  Node: SchemaNodeModel<MySchema>;
  Edge: SchemaEdgeModel<MySchema>;
}

describe('without a schema', () => {
  it('adds and changes nothing', () => {
    expectTypeOf<
      keyof SchemaAttributeTypes<EmptySchema, SchemaKind>
    >().toEqualTypeOf<never>();
    expectTypeOf<
      AttributesObject<NodeAttributeKey, Record<never, never>>
    >().toEqualTypeOf<{ [K in NodeAttributeKey]?: Attribute<K> }>();
    expectTypeOf<
      AttributesEntities<EdgeAttributeKey, Record<never, never>>
    >().toEqualTypeOf<
      readonly [EdgeAttributeKey, Attribute<EdgeAttributeKey>][]
    >();
    expectTypeOf<
      NodeAttributesObject<EmptySchema>
    >().toEqualTypeOf<NodeAttributesObject>();
    expectTypeOf<
      SubgraphAttributesFor<'a', EmptySchema>
    >().toEqualTypeOf<NonClusterSubgraphAttributesObject>();
  });

  it('builds every attribute type from the generated value type names', () => {
    expectTypeOf<{
      [K in AttributeKey]: AttributeValueTypes[AttributeValueTypeNames[K]];
    }>().toEqualTypeOf<{ [K in AttributeKey]: Attribute<K> }>();
  });

  it('still rejects unknown keys', () => {
    digraph((g) => {
      // @ts-expect-error not an attribute without a schema
      g.node('a', { 'data-id': 1 });
      // @ts-expect-error not an attribute without a schema
      g.set('hoge', 'x');
    });
  });
});

describe('a schema', () => {
  const { digraph: myDigraph } = withContext(ctx);

  it('types the models created through withContext', () => {
    myDigraph((g) => {
      expectTypeOf(g).toEqualTypeOf<SchemaRootGraphModel<MyTypes>>();
      expectTypeOf(g.node('a')).toEqualTypeOf<SchemaNodeModel<MySchema>>();
      expectTypeOf(g.edge(['a', 'b'])).toEqualTypeOf<
        SchemaEdgeModel<MySchema>
      >();
      g.subgraph('s', (s) => {
        expectTypeOf(s).toEqualTypeOf<SchemaSubgraphModel<MyTypes>>();
        expectTypeOf(s.node('b')).toEqualTypeOf<SchemaNodeModel<MySchema>>();
      });
    });
  });

  it('adds node attributes to nodes only', () => {
    myDigraph((g) => {
      const a = g.node('a', { 'data-id': 1 });
      expectTypeOf(a.attributes.get('data-id')).toEqualTypeOf<
        number | undefined
      >();
      a.attributes.set('data-id', 2);
      g.node({ 'data-id': 3 });
      g.attributes.node.set('data-id', 4);
      // @ts-expect-error a number
      g.node('b', { 'data-id': 'x' });
      // @ts-expect-error a number
      a.attributes.set('data-id', 'x');
      // @ts-expect-error a node attribute
      g.edge(['a', 'b'], { 'data-id': 1 });
      // @ts-expect-error a node attribute
      g.set('data-id', 1);
      g.edge(['a', 'b'], { 'edge-only': true });
      // @ts-expect-error an edge attribute
      g.node('c', { 'edge-only': true });
    });
  });

  it('adds graph attributes to the root graph', () => {
    myDigraph((g) => {
      g.set('hoge', 'x');
      g.apply({ hoge: 'y' });
      expectTypeOf(g.get('hoge')).toEqualTypeOf<string | undefined>();
      // @ts-expect-error a string
      g.set('hoge', 1);
      g.subgraph('s', (s) => {
        // @ts-expect-error a root graph attribute
        s.set('hoge', 'x');
      });
    });
    expectTypeOf<GraphAttributesObject<MySchema>>().toHaveProperty('hoge');
  });

  it('adds cluster attributes to clusters only', () => {
    myDigraph((g) => {
      g.subgraph('cluster_a', { team: 'core' });
      g.createSubgraph('cluster_b', { team: 'infra', label: 'B' });
      g.subgraph({ cluster: true, team: 'core' });
      g.subgraph('x', { cluster: true, team: 'core' });
      // @ts-expect-error not a team
      g.subgraph('cluster_c', { team: 'other' });
      // @ts-expect-error team applies to clusters
      g.subgraph('row', { team: 'core' });
      // @ts-expect-error team applies to clusters
      g.createSubgraph({ team: 'core' });
      // @ts-expect-error not next to a subgraph attribute either
      g.subgraph('row', { lane: 1, team: 'core' });
      // @ts-expect-error a cluster attribute
      g.node('a', { team: 'core' });
    });
    expectTypeOf<SubgraphAttributesFor<'cluster_x', MySchema>>().toEqualTypeOf<
      ClusterSubgraphAttributesObject<MySchema>
    >();
  });

  it('adds subgraph attributes to subgraphs that are not clusters', () => {
    myDigraph((g) => {
      g.subgraph('row', { lane: 1, rank: 'same' });
      g.createSubgraph({ lane: 2 });
      // @ts-expect-error lane applies to subgraphs that are not clusters
      g.subgraph('cluster_a', { lane: 1 });
      // A subgraph model may be either, so it takes both.
      g.subgraph('s', (s) => {
        s.set('lane', 1);
        s.set('team', 'core');
        // @ts-expect-error a number
        s.set('lane', 'x');
      });
      g.graph({ lane: 1, team: 'infra' });
    });
    expectTypeOf<SubgraphAttributesObject<MySchema>>().toHaveProperty('team');
  });

  it('extends a built-in attribute', () => {
    myDigraph((g) => {
      g.edge(['a', 'b'], { dir: 'sideways' });
      const e = g.edge(['a', 'b'], { dir: 'both' });
      expectTypeOf(e.attributes.get('dir')).toEqualTypeOf<
        'forward' | 'back' | 'both' | 'none' | 'sideways' | undefined
      >();
      // @ts-expect-error neither built in nor added
      g.edge(['a', 'b'], { dir: 'up' });
    });
  });

  it('overrides a built-in attribute', () => {
    myDigraph((g) => {
      const a = g.node('a', { label: 1 });
      expectTypeOf(a.attributes.get('label')).toEqualTypeOf<
        number | undefined
      >();
      // @ts-expect-error a number now
      g.node('b', { label: 'x' });
      // @ts-expect-error a number now
      a.attributes.set('label', 'x');
      // @ts-expect-error a number now
      a.attributes.apply({ label: 'x' });
      // @ts-expect-error a number now
      a.attributes.apply([['label', 'x']]);
      a.attributes.apply([['label', 1]]);
      // Only on nodes: edges keep the built-in label.
      g.edge(['a', 'b'], { label: 'x' });
    });
  });

  it('extends a value type wherever it is used', () => {
    myDigraph((g) => {
      g.node('a', { color: 'brand-blue', fillcolor: 'brand-blue' });
      g.edge(['a', 'b'], { color: 'brand-blue', fontcolor: 'brand-blue' });
      g.set('bgcolor', 'brand-blue');
      g.subgraph('cluster_a', { pencolor: 'brand-blue' });
      g.node('b', { style: 'filled,my-style' });
      g.edge(['a', 'b'], { arrowhead: 'omy-arrow', headport: 'p:mid' });
      g.node('c', { color: 'red' });
      g.edge(['a', 'b'], { labelfontcolor: 'brand-blue' });
      // @ts-expect-error not a color (color also takes a color list, any string)
      g.edge(['a', 'b'], { labelfontcolor: 'brand-red' });
      // @ts-expect-error not a style
      g.node('e', { style: 'my-other-style' });
    });
  });

  it('overrides a value type wherever it is used', () => {
    myDigraph((g) => {
      g.set('rankdir', 'LR');
      // @ts-expect-error TB or LR only
      g.set('rankdir', 'BT');
    });
  });

  it('applies a per-attribute entry over the value type change', () => {
    myDigraph((g) => {
      g.node('a', { fontcolor: 'white' });
      // @ts-expect-error the node entry overrides types.color
      g.node('b', { fontcolor: 'brand-blue' });
      g.edge(['a', 'b'], { fontcolor: 'brand-blue' });
    });
  });

  it('reads an entry of no single mode as the widest one', () => {
    type Loose = {
      node: { label: SchemaEntry<number>; 'x-new': SchemaEntry<number> };
    };
    expectTypeOf<SchemaAttributeTypes<Loose, 'node'>>().toEqualTypeOf<{
      label: Attribute<'label'> | number;
      'x-new': number;
    }>();
  });

  it('takes words for the value types built from words', () => {
    expectTypeOf<{
      types: { style: Override<number> };
    }>().not.toExtend<Schema>();
    expectTypeOf<{
      types: { compass: Extend<'mid'>; color: Extend<0x1234> };
    }>().toExtend<Schema>();
  });

  it('cannot change cluster, which picks the subgraph attributes', () => {
    expectTypeOf<{
      subgraph: { cluster: Override<string> };
    }>().not.toExtend<Schema>();
    expectTypeOf<{
      cluster: { cluster: Extend<'yes'> };
    }>().not.toExtend<Schema>();
  });

  it('adds only models and default attributes typed with the schema', () => {
    myDigraph((g) => {
      g.addNode(g.node('a'));
      g.addAttributeList('Node', { 'data-id': 1, label: 2 });
      g.addAttributeList('Graph', [['team', 'core']]);
      // @ts-expect-error a number now
      g.addAttributeList('Node', { label: 'x' });
      // @ts-expect-error a node attribute
      g.addAttributeList('Edge', { 'data-id': 1 });
    });
    const plain = digraph().node('a');
    // The same keys as MySchema; only the type of a node's label differs.
    type OtherSchema = Omit<MySchema, 'node'> & {
      node: Omit<MySchema['node'], 'label'> & { label: Override<string> };
    };
    type OtherTypes = SchemaModelTypes<OtherSchema>;
    const other = withContext({} as ModelsContext<OtherTypes>);
    myDigraph((g) => {
      // @ts-expect-error a node without the schema may hold a string label
      g.addNode(plain);
      other.digraph((o) => {
        // @ts-expect-error a node of another schema may hold a string label
        g.addNode(o.node('a'));
        // Its edges have the same attribute types as ours.
        g.addEdge(o.edge(['a', 'b']));
        // @ts-expect-error nor a subgraph of another schema
        g.addSubgraph(o.subgraph('s'));
      });
      expectTypeOf<SchemaNodeModel<OtherSchema>>().not.toExtend<
        SchemaNodeModel<MySchema>
      >();
      expectTypeOf<SchemaRootGraphModel<OtherTypes>>().not.toExtend<
        SchemaRootGraphModel<MyTypes>
      >();
    });
  });

  it('keeps the built-in entry type in values', () => {
    // So that the models stay assignable to the ones without a schema;
    // get() is typed with the schema.
    myDigraph((g) => {
      expectTypeOf(g.node('a').attributes.values).toEqualTypeOf<
        ReadonlyArray<[NodeAttributeKey, Attribute<NodeAttributeKey>]>
      >();
    });
  });

  it('still rejects unknown keys', () => {
    myDigraph((g) => {
      // @ts-expect-error not an attribute
      g.node('a', { 'data-di': 1 });
      // @ts-expect-error not an attribute
      g.node('a').attributes.set('data-di', 1);
      // @ts-expect-error not an attribute
      g.set('hoeg', 'x');
    });
  });

  it('keeps the models assignable to the ones without a schema', () => {
    expectTypeOf<SchemaNodeModel<MySchema>>().toExtend<NodeModel>();
    expectTypeOf<SchemaEdgeModel<MySchema>>().toExtend<EdgeModel>();
    expectTypeOf<SchemaSubgraphModel<MyTypes>>().toExtend<SubgraphModel>();
    expectTypeOf<SchemaRootGraphModel<MyTypes>>().toExtend<RootGraphModel>();
    expectTypeOf(ctx).toExtend<ModelsContext>();
    myDigraph((g) => {
      const a = g.node('a');
      g.addNode(a);
      g.edge([a, 'b']);
      g.addSubgraph(g.subgraph('s'));
      expectTypeOf(toDot(g)).toEqualTypeOf<string>();
    });
  });

  it('cannot call the overloads that keep the models assignable', () => {
    myDigraph((g) => {
      const anything: unknown = 'a';
      // @ts-expect-error no overload takes unknown
      g.node(anything);
      // @ts-expect-error no overload takes unknown
      g.get(anything);
    });
  });

  it('types the models of createModelsContext', () => {
    const models = createModelsContext(ctx);
    expectTypeOf(new models.Node('a')).toEqualTypeOf<
      SchemaNodeModel<MySchema>
    >();
    expectTypeOf(new models.Digraph()).toEqualTypeOf<
      SchemaRootGraphModel<MyTypes>
    >();
  });

  it('types what fromDot and fromDotAll create', () => {
    const g = fromDot('digraph { a }', { convert: { models: ctx } });
    expectTypeOf(g).toEqualTypeOf<SchemaRootGraphModel<MyTypes>>();
    g.set('hoge', 'x');
    const [first] = fromDotAll('digraph { a }', { convert: { models: ctx } });
    expectTypeOf(first.nodes).toEqualTypeOf<
      ReadonlyArray<SchemaNodeModel<MySchema>>
    >();
  });

  it('works with model types written by hand', () => {
    const { graph } = withContext({} as ModelsContext<HandTypes>);
    graph((g) => {
      expectTypeOf(g).toEqualTypeOf<SchemaRootGraphModel<HandTypes>>();
      g.node('a', { 'data-id': 1 });
      g.subgraph('cluster_a', { team: 'core' }, (s) => {
        expectTypeOf(s).toEqualTypeOf<SchemaSubgraphModel<HandTypes>>();
      });
    });
  });
});
