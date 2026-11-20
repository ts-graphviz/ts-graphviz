import {
  type Attribute,
  Digraph,
  type DotValue,
  type DSL,
  defaultModelKit,
  dsl,
  type FromDotResult,
  type HasComments,
  type ModelFactory,
  type ModelFactoryCallback,
  type ModelKit,
  type ModelTypes,
  modelOf,
  Node,
  type NodeAttributeKey,
  type NodeDSL,
  type NodeDSLMembers,
  type NodeModel,
  type ReadonlyNodeModel,
  type RootGraphDSL,
  type RootGraphModel,
  type SchemaEntry,
  type SchemaOfModel,
  Subgraph,
  type SubgraphModel,
} from 'ts-graphviz';
import { describe, expectTypeOf, it } from 'vitest';

// The DSL of the models of a schema. The schema is written by hand, as
// `defineSchema` will produce it.

type Add<T extends DotValue> = SchemaEntry<T, 'add'>;
type Extend<T extends DotValue> = SchemaEntry<T, 'extend'>;
type Override<T extends DotValue> = SchemaEntry<T, 'override'>;

type MySchema = {
  types: { color: Extend<'brand-blue'> };
  graph: { hoge: Add<string> };
  subgraph: { lane: Add<number> };
  cluster: { team: Add<'core' | 'infra'> };
  node: { 'data-id': Add<number>; label: Override<number> };
  edge: { 'edge-only': Add<boolean>; dir: Extend<'sideways'> };
};
type MyTypes = ModelTypes<MySchema>;

class MyNode extends Node<MySchema> {
  extra(): string {
    return this.id;
  }
}

describe('without a schema', () => {
  it('is the DSL of the built-in attributes', () => {
    expectTypeOf<DSL<NodeModel>>().toEqualTypeOf<
      NodeDSLMembers<NodeModel> & { [K in NodeAttributeKey]?: Attribute<K> }
    >();
    expectTypeOf<DSL<RootGraphModel>>().toEqualTypeOf<
      RootGraphDSL<RootGraphModel, ModelTypes>
    >();
    expectTypeOf<SchemaOfModel<RootGraphModel>>().toEqualTypeOf<
      Record<never, never>
    >();
  });
});

describe('the DSL of a model of a schema', () => {
  const g = dsl(new Digraph<MySchema>());

  it('reads the schema from the model', () => {
    expectTypeOf<SchemaOfModel<Digraph<MySchema>>>().toEqualTypeOf<MySchema>();
    expectTypeOf<SchemaOfModel<MyNode>>().toEqualTypeOf<MySchema>();
    expectTypeOf<
      SchemaOfModel<SubgraphModel<MySchema>>
    >().toEqualTypeOf<MySchema>();
  });

  it('has the attributes of the schema as properties', () => {
    expectTypeOf(g.hoge).toEqualTypeOf<string | undefined>();
    expectTypeOf(g.rankdir).toEqualTypeOf<Attribute<'rankdir'> | undefined>();
    const a = g.node('a');
    expectTypeOf(a.label).toEqualTypeOf<number | undefined>();
    expectTypeOf(a['data-id']).toEqualTypeOf<number | undefined>();
    expectTypeOf(a.color).toEqualTypeOf<
      Attribute<'color'> | 'brand-blue' | undefined
    >();
    a.label = 1;
    // @ts-expect-error the schema makes a node's label a number
    a.label = 'A';
    const e = g.edge(['a', 'b']);
    expectTypeOf(e['edge-only']).toEqualTypeOf<boolean | undefined>();
    e.dir = 'sideways';
    // @ts-expect-error a node attribute of the schema
    e['data-id'];
  });

  it('types what the statements take and give', () => {
    expectTypeOf(g.node('a')).toEqualTypeOf<DSL<NodeModel<MySchema>>>();
    g.node('a', { label: 1, 'data-id': 2 });
    // @ts-expect-error a number is expected
    g.node('b', { 'data-id': 'x' });
    g.edge(['a', 'b'], { 'edge-only': true });
    g.subgraph('cluster_a', { team: 'core' }, (c) => {
      expectTypeOf(c.team).toEqualTypeOf<'core' | 'infra' | undefined>();
      c.node('c', { label: 3 });
    });
    g.subgraph('s', { lane: 1 });
    // @ts-expect-error a cluster attribute on a subgraph that is not one
    g.subgraph('s', { team: 'core' });
    expectTypeOf(g.subgraph('s')).toEqualTypeOf<
      DSL<SubgraphModel<MySchema>, MyTypes>
    >();
    const nodes = g.node({ label: 1 });
    expectTypeOf(nodes.label).toEqualTypeOf<number | undefined>();
    // @ts-expect-error a node's label is a number
    g.node({ label: 'x' });
    g.graph({ lane: 2 });
  });

  it('keeps the members of a class of the schema', () => {
    const n = dsl(new MyNode('a'));
    expectTypeOf(n).toEqualTypeOf<NodeDSL<MyNode>>();
    expectTypeOf(n.label).toEqualTypeOf<number | undefined>();
    expectTypeOf(modelOf(n).extra()).toEqualTypeOf<string>();
  });

  it('takes a kit of the same schema only', () => {
    const kit = {} as ModelKit<MyTypes>;
    expectTypeOf(dsl(new Digraph<MySchema>(), kit)).toEqualTypeOf<
      DSL<Digraph<MySchema>, MyTypes>
    >();
    // @ts-expect-error the default kit has no schema
    dsl(new Digraph<MySchema>(), defaultModelKit);
    // @ts-expect-error the graph has no schema
    dsl(new Digraph(), kit);
    type OtherSchema = { graph: { other: Add<string> } };
    const either = new Digraph<MySchema>() as
      | Digraph<MySchema>
      | Digraph<OtherSchema>;
    // @ts-expect-error the graph may be of another schema than the kit's
    dsl(either, kit);
    // A node does not create: any kit.
    dsl(new MyNode('a'), defaultModelKit);
    dsl(new Subgraph<MySchema>(), kit);
  });

  it('is not made of a read-only model', () => {
    // @ts-expect-error a read-only model has no DSL
    dsl({} as ReadonlyNodeModel);
  });
});

describe('the factory and fromDot types of a model of a schema', () => {
  it('create with the schema of the graph by default', () => {
    expectTypeOf<
      Parameters<ModelFactoryCallback<RootGraphModel<MySchema>>>[0]
    >().toEqualTypeOf<DSL<RootGraphModel<MySchema>, MyTypes>>();
    expectTypeOf<FromDotResult<RootGraphModel<MySchema>, true>>().toEqualTypeOf<
      DSL<RootGraphModel<MySchema>, MyTypes>
    >();
    expectTypeOf<
      ReturnType<ModelFactory<RootGraphModel<MySchema>>>
    >().toEqualTypeOf<DSL<RootGraphModel<MySchema>, MyTypes>>();
  });

  it('is not made of a read-only model with comments', () => {
    // @ts-expect-error its attributes do not write
    dsl({} as ReadonlyNodeModel & HasComments);
  });
});
