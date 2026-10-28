import { fromModel } from '@ts-graphviz/ast';
import {
  type AnyModelTypes,
  type Attribute,
  type AttributeKey,
  type AttributeListKind,
  type AttributeListModel,
  type Attributes,
  type AttributesEntities,
  type AttributesObject,
  type AttributeValueTypeNames,
  type AttributeValueTypes,
  type ClusterSubgraphAttributesObject,
  createModelsContext,
  Digraph,
  Dot,
  type DotModel,
  type DotValue,
  defaultModelsContext,
  digraph,
  Edge,
  type EdgeAttributeKey,
  type EdgeModel,
  type EmptySchema,
  Graph,
  type GraphAttributesObject,
  type GraphCommonAttributes,
  type ModelsContext,
  type ModelTypes,
  Node,
  type NodeAttributeKey,
  type NodeAttributesObject,
  type NodeModel,
  type NonClusterSubgraphAttributesObject,
  OrderedDigraph,
  type ReadonlyAttributeListModel,
  type ReadonlyDotModel,
  type ReadonlyEdgeModel,
  type ReadonlyNodeModel,
  type ReadonlyRootGraphModel,
  type ReadonlySubgraphModel,
  type RootGraphConstructor,
  type RootGraphModel,
  type Schema,
  type SchemaAttributeTypes,
  type SchemaEntry,
  type SchemaKind,
  type SchemaOf,
  Subgraph,
  type SubgraphAttributesFor,
  type SubgraphAttributesObject,
  type SubgraphModel,
  toDot,
} from 'ts-graphviz';
import { type DotInput, toFile } from 'ts-graphviz/adapter';
import { describe, expectTypeOf, it } from 'vitest';

// The schema type parameters on the model types and the generic core
// classes (#1841, option B, PR B). The schemas are written by hand here, as
// `defineSchema` (PR C) will produce them; a graph of a schema is made by
// giving the core class its model types (`new Digraph<ModelTypes<S>>()`).

type Add<T extends DotValue> = SchemaEntry<T, 'add'>;
type Extend<T extends DotValue> = SchemaEntry<T, 'extend'>;
type Override<T extends DotValue> = SchemaEntry<T, 'override'>;

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
type MyTypes = ModelTypes<MySchema>;

// The same keys as MySchema; only the type of a node's label differs.
type OtherSchema = Omit<MySchema, 'node'> & {
  node: Omit<MySchema['node'], 'label'> & { label: Override<string> };
};
type OtherTypes = ModelTypes<OtherSchema>;

/** A root graph of MySchema, as the core classes create it. */
function myDigraph(callback: (g: Digraph<MyTypes>) => void): Digraph<MyTypes> {
  const g = new Digraph<MyTypes>();
  callback(g);
  return g;
}

describe('without a schema', () => {
  it('adds and changes nothing', () => {
    expectTypeOf<
      keyof SchemaAttributeTypes<EmptySchema, SchemaKind>
    >().toEqualTypeOf<never>();
    expectTypeOf<AttributesObject<NodeAttributeKey>>().toEqualTypeOf<{
      [K in NodeAttributeKey]?: Attribute<K>;
    }>();
    expectTypeOf<AttributesEntities<EdgeAttributeKey>>().toEqualTypeOf<
      readonly [EdgeAttributeKey, Attribute<EdgeAttributeKey>][]
    >();
    expectTypeOf<
      NodeAttributesObject<EmptySchema>
    >().toEqualTypeOf<NodeAttributesObject>();
    expectTypeOf<
      SubgraphAttributesFor<'a', EmptySchema>
    >().toEqualTypeOf<NonClusterSubgraphAttributesObject>();
    expectTypeOf<NodeModel<EmptySchema>>().toEqualTypeOf<NodeModel>();
    expectTypeOf<ModelTypes<EmptySchema>>().toEqualTypeOf<ModelTypes>();
    expectTypeOf<SchemaOf<ModelTypes>>().toEqualTypeOf<EmptySchema>();
    expectTypeOf<
      RootGraphModel<ModelTypes<EmptySchema>>
    >().toEqualTypeOf<RootGraphModel>();
  });

  it('builds every attribute type from the generated value type names', () => {
    expectTypeOf<{
      [K in AttributeKey]: AttributeValueTypes[AttributeValueTypeNames[K]];
    }>().toEqualTypeOf<{ [K in AttributeKey]: Attribute<K> }>();
  });

  it('types attributes and models as before', () => {
    digraph((g) => {
      const a = g.node('a', { label: 'A' });
      expectTypeOf(a).toEqualTypeOf<NodeModel>();
      expectTypeOf(a.attributes.get('label')).toEqualTypeOf<
        Attribute<'label'> | undefined
      >();
      expectTypeOf(a.attributes.values).toEqualTypeOf<
        ReadonlyArray<[NodeAttributeKey, Attribute<NodeAttributeKey>]>
      >();
      expectTypeOf(g.attributes).toEqualTypeOf<
        Readonly<GraphCommonAttributes>
      >();
      expectTypeOf(g.statements).toEqualTypeOf<
        ReadonlyArray<
          NodeModel | EdgeModel | SubgraphModel | AttributeListModel
        >
      >();
      g.addAttributeList('Node', { label: 'x', rank: 'same' });
    });
    expectTypeOf(new Node('a')).toEqualTypeOf<Node<EmptySchema>>();
    expectTypeOf(new Digraph()).toEqualTypeOf<Digraph<ModelTypes>>();
    expectTypeOf(new Dot()).toEqualTypeOf<Dot<EmptySchema>>();
    expectTypeOf(defaultModelsContext()).toEqualTypeOf<ModelsContext>();
  });

  it('forwards a generic key and its value as before', () => {
    function write<K extends NodeAttributeKey>(
      attributes: Attributes<NodeAttributeKey>,
      key: K,
      value: Attribute<K>,
    ): Attribute<K> | undefined {
      attributes.set(key, value);
      return attributes.get(key);
    }
    expectTypeOf(write(new Node('a').attributes, 'label', 'x')).toEqualTypeOf<
      Attribute<'label'> | undefined
    >();
    const anyKeys: Attributes<any> = new Node('a').attributes;
    anyKeys.set('label', 'x');
  });

  it('still rejects unknown keys and values', () => {
    digraph((g) => {
      // @ts-expect-error not an attribute without a schema
      g.node('a', { 'data-id': 1 });
      // @ts-expect-error not an attribute without a schema
      g.set('hoge', 'x');
      // @ts-expect-error a label is not a boolean
      g.node('b', { label: true });
      // @ts-expect-error an array is not an attribute object
      g.edge(['a']);
    });
  });

  it('keeps a model with fewer keys or narrower types one of the wider', () => {
    // As before: a list of node attributes is an attribute list.
    expectTypeOf<
      GraphCommonAttributes['node']
    >().toExtend<AttributeListModel>();
    expectTypeOf<NodeModel['attributes']>().toExtend<
      Attributes<AttributeKey>
    >();
    expectTypeOf<
      AttributeListModel<'Node', 'label'>
    >().toExtend<AttributeListModel>();
  });

  it('keeps graphs of custom classes graphs of the default model types', () => {
    class MyNode extends Node {}
    const models = createModelsContext({ Node: MyNode });
    expectTypeOf(models).toExtend<ModelsContext>();
    const g = new models.Digraph();
    expectTypeOf(g).toExtend<RootGraphModel>();
    new Digraph().with(models);
    new Dot().addGraph(g);
  });

  it('constructs a union of the core classes through RootGraphConstructor', () => {
    const directed = Math.random() < 0.5;
    // The classes are generic, so `new (directed ? Digraph : Graph)()` is
    // not constructable; as constructors of a context they are.
    const Class: RootGraphConstructor = directed ? Digraph : Graph;
    expectTypeOf(new Class('G', true)).toEqualTypeOf<RootGraphModel>();
  });
});

describe('a schema', () => {
  it('types the models a graph of the schema creates', () => {
    myDigraph((g) => {
      expectTypeOf(g).toExtend<RootGraphModel<MyTypes>>();
      expectTypeOf(g.node('a')).toEqualTypeOf<NodeModel<MySchema>>();
      expectTypeOf(g.edge(['a', 'b'])).toEqualTypeOf<EdgeModel<MySchema>>();
      g.subgraph('s', (s) => {
        expectTypeOf(s).toEqualTypeOf<SubgraphModel<MyTypes>>();
        expectTypeOf(s.node('b')).toEqualTypeOf<NodeModel<MySchema>>();
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
    new Digraph<MyTypes>('G', { hoge: 'x' });
    // @ts-expect-error a string
    new Digraph<MyTypes>('G', { hoge: 1 });
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

  it('types the values read back with the schema', () => {
    myDigraph((g) => {
      const [entry] = g.node('a').attributes.values;
      if (entry !== undefined && entry[0] === 'label') {
        expectTypeOf(entry[1]).toEqualTypeOf<number>();
      }
      if (entry !== undefined && entry[0] === 'data-id') {
        expectTypeOf(entry[1]).toEqualTypeOf<number>();
      }
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

  it('takes only values that DOT can print', () => {
    expectTypeOf<{
      node: { meta: SchemaEntry<number> };
    }>().toExtend<Schema>();
    expectTypeOf<{
      node: { meta: { mode: 'add'; '~type'?: { type: Date } } };
    }>().not.toExtend<Schema>();
    // @ts-expect-error an object is not a DOT value
    type _Bad = SchemaEntry<{ id: number }, 'add'>;
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

  it('takes default attributes of the kind, typed with the schema', () => {
    myDigraph((g) => {
      g.addAttributeList('Node', { 'data-id': 1, label: 2 });
      g.addAttributeList('Graph', [['team', 'core']]);
      g.addAttributeList('Edge', { label: 'x', 'edge-only': true });
      // @ts-expect-error a number on nodes (the label of edges is a string)
      g.addAttributeList('Node', { label: 'x' });
      // @ts-expect-error a number
      g.addAttributeList('Node', { 'data-id': 'x' });
      // @ts-expect-error a node attribute
      g.addAttributeList('Graph', { 'data-id': 1 });
      // @ts-expect-error not an attribute of any kind
      g.addAttributeList('Edge', { 'data-di': 1 });
      // A kind known only at run time takes the built-in attributes of
      // every kind that the schema does not change.
      const kind = 'Node' as AttributeListKind;
      g.addAttributeList(kind, { fontsize: 12, fontname: 'x' });
      // @ts-expect-error a number for nodes, a string for edges
      g.addAttributeList(kind, { label: 1 });
      // @ts-expect-error not an edge attribute
      g.addAttributeList(kind, { shape: 'box' });
    });
  });

  it('adds only models of the same schema', () => {
    const plain = digraph().node('a');
    const other = new Digraph<OtherTypes>();
    myDigraph((g) => {
      g.addNode(g.node('a'));
      g.addNode(new Node<MySchema>('b', { label: 1 }));
      // @ts-expect-error a node without the schema may hold a string label
      g.addNode(plain);
      // @ts-expect-error a node of another schema may hold a string label
      g.addNode(other.node('a'));
      // Its edges have the same attribute types as ours.
      g.addEdge(other.edge(['a', 'b']));
      // @ts-expect-error nor a subgraph of another schema
      g.addSubgraph(other.subgraph('s'));
      // @ts-expect-error nor remove one
      g.removeNode(other.node('a'));
      g.addSubgraph(g.subgraph('s'));
      // An edge may refer to a node of any schema: only its id is used.
      g.edge([plain, other.node('a')]);
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
});

describe('the models of a schema and the read-only model types', () => {
  it('fit the read-only model types', () => {
    expectTypeOf<NodeModel<MySchema>>().toExtend<ReadonlyNodeModel>();
    expectTypeOf<EdgeModel<MySchema>>().toExtend<ReadonlyEdgeModel>();
    expectTypeOf<SubgraphModel<MyTypes>>().toExtend<ReadonlySubgraphModel>();
    expectTypeOf<RootGraphModel<MyTypes>>().toExtend<ReadonlyRootGraphModel>();
    expectTypeOf<DotModel<MySchema>>().toExtend<ReadonlyDotModel>();
    expectTypeOf<GraphCommonAttributes<MySchema>['node']>().toExtend<
      ReadonlyAttributeListModel<'Node'>
    >();
    expectTypeOf<Digraph<MyTypes>>().toExtend<ReadonlyRootGraphModel>();
    expectTypeOf<Node<MySchema>>().toExtend<ReadonlyNodeModel>();
    expectTypeOf<MyTypes>().toExtend<AnyModelTypes>();
  });

  it('are not the models of no schema, nor those of another schema', () => {
    expectTypeOf<NodeModel<MySchema>>().not.toExtend<NodeModel>();
    expectTypeOf<NodeModel>().not.toExtend<NodeModel<MySchema>>();
    expectTypeOf<NodeModel<OtherSchema>>().not.toExtend<NodeModel<MySchema>>();
    expectTypeOf<EdgeModel<MySchema>>().not.toExtend<EdgeModel>();
    expectTypeOf<SubgraphModel<MyTypes>>().not.toExtend<SubgraphModel>();
    expectTypeOf<RootGraphModel<MyTypes>>().not.toExtend<RootGraphModel>();
    expectTypeOf<RootGraphModel<OtherTypes>>().not.toExtend<
      RootGraphModel<MyTypes>
    >();
    expectTypeOf<ModelsContext<MyTypes>>().not.toExtend<ModelsContext>();
    expectTypeOf<ModelsContext>().not.toExtend<ModelsContext<MyTypes>>();
    expectTypeOf<Node<MySchema>>().not.toExtend<NodeModel>();
  });

  it('keep a schema that only adds attributes apart from no schema', () => {
    type AddOnly = { node: { 'data-id': Add<number> } };
    expectTypeOf<NodeModel>().not.toExtend<NodeModel<AddOnly>>();
    expectTypeOf<NodeModel<AddOnly>>().not.toExtend<NodeModel>();
  });

  it('are read by toDot, fromModel and the adapter', () => {
    const g = myDigraph((g) => {
      g.node('a', { label: 1 });
    });
    expectTypeOf(toDot(g)).toEqualTypeOf<string>();
    expectTypeOf(toDot(g.node('a'))).toEqualTypeOf<string>();
    fromModel(g);
    expectTypeOf(g).toExtend<DotInput>();
    toFile(g, 'out.svg');
    const dot = new Dot<MySchema>([g]);
    expectTypeOf(toDot(dot)).toEqualTypeOf<string>();
  });

  it('are read in code generic over the schema', () => {
    function print<S extends Schema>(
      g: RootGraphModel<ModelTypes<S>>,
      n: NodeModel<S>,
    ): string {
      const readonlyGraph: ReadonlyRootGraphModel = g;
      const readonlyNode: ReadonlyNodeModel = n;
      return `${toDot(g)}${toDot(n)}${readonlyGraph.id}${readonlyNode.id}`;
    }
    print(new Digraph<MyTypes>(), new Node<MySchema>('a'));
    print(new Digraph(), new Node('a'));

    function labelOf<S extends Schema>(n: NodeModel<S>) {
      return n.attributes.get('label');
    }
    expectTypeOf(labelOf(new Node<MySchema>('a'))).toEqualTypeOf<
      number | undefined
    >();
    expectTypeOf(labelOf(new Node('a'))).toEqualTypeOf<
      Attribute<'label'> | undefined
    >();
  });
});

describe('the core classes', () => {
  class MyNode extends Node<MySchema> {
    get dataId() {
      return this.attributes.get('data-id');
    }
  }

  it('take the schema as a type parameter', () => {
    const n = new Node<MySchema>('a', { label: 1, 'data-id': 2 });
    expectTypeOf(n).toExtend<NodeModel<MySchema>>();
    // @ts-expect-error a number
    new Node<MySchema>('a', { label: 'x' });
    const e = new Edge<MySchema>([n, n], { 'edge-only': true });
    expectTypeOf(e).toExtend<EdgeModel<MySchema>>();
    // @ts-expect-error an edge attribute
    new Edge<MySchema>([n, n], { 'data-id': 1 });
    const s = new Subgraph<MyTypes>('cluster_a', { team: 'core' });
    expectTypeOf(s).toExtend<SubgraphModel<MyTypes>>();
    expectTypeOf(new OrderedDigraph<MyTypes>()).toExtend<
      RootGraphModel<MyTypes>
    >();
    expectTypeOf(new Graph<MyTypes>().node('a')).toEqualTypeOf<
      NodeModel<MySchema>
    >();
  });

  it('are subclassed for a schema', () => {
    const n = new MyNode('a', { 'data-id': 1 });
    expectTypeOf(n.dataId).toEqualTypeOf<number | undefined>();
    expectTypeOf(n).toExtend<NodeModel<MySchema>>();
    myDigraph((g) => {
      g.addNode(n);
    });
    // @ts-expect-error a node of the schema is not a plain node
    digraph().addNode(n);
  });

  it('take a context of the schema', () => {
    const models = {} as ModelsContext<MyTypes>;
    expectTypeOf(new models.Node('a', { label: 1 })).toEqualTypeOf<
      NodeModel<MySchema>
    >();
    // @ts-expect-error a number
    new models.Node('a', { label: 'x' });
    myDigraph((g) => {
      g.with(models);
      g.with({ Node: MyNode });
      // @ts-expect-error the classes create nodes of no schema
      g.with({} as ModelsContext);
    });
  });
});
