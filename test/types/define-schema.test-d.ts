import {
  type Attribute,
  attr,
  createModelKit,
  type DSL,
  defineSchema,
  dsl,
  type EdgeModel,
  fromDot,
  fromDotAll,
  type ModelKit,
  type ModelTypes,
  modelOf,
  Node,
  type NodeModel,
  type RootGraphModel,
  type SchemaEntry,
  values,
  withModelKit,
} from 'ts-graphviz';
import * as legacy from 'ts-graphviz/legacy';
import { describe, expectTypeOf, it } from 'vitest';

const schema = defineSchema({
  types: { color: values.extend<'brand-blue'>() },
  graph: { hoge: attr<string>() },
  cluster: { team: attr<'core' | 'infra'>() },
  node: { 'data-id': attr<number>(), label: attr.override<number>() },
  edge: { dir: attr.extend<'sideways'>() },
});
type MySchema = typeof schema;

class MyNode extends Node<MySchema> {
  extra(): string {
    return this.id;
  }
}

describe('attr and values', () => {
  it('need a type argument', () => {
    // @ts-expect-error no type argument
    attr();
    // @ts-expect-error no type argument
    attr.extend();
    // @ts-expect-error no type argument
    attr.override();
    // @ts-expect-error no type argument
    values.extend();
    // @ts-expect-error no type argument
    values.override();
    // @ts-expect-error not a value that can be written to DOT
    attr<{ a: 1 }>();
    expectTypeOf(attr<number>()).toEqualTypeOf<SchemaEntry<number, 'add'>>();
  });
});

describe('defineSchema', () => {
  it('gives the schema with the types of its entries', () => {
    expectTypeOf(schema.node['data-id']).toEqualTypeOf<
      SchemaEntry<number, 'add'>
    >();
    expectTypeOf(schema.types.color).toEqualTypeOf<
      SchemaEntry<'brand-blue', 'extend'>
    >();
  });

  it('says how to change a built-in attribute', () => {
    defineSchema({
      // @ts-expect-error a built-in attribute: attr.extend or attr.override
      node: { label: attr<number>() },
    });
    defineSchema({
      // @ts-expect-error not a built-in attribute: attr
      node: { 'data-id': attr.extend<number>() },
    });
    defineSchema({
      // @ts-expect-error a built-in attribute of a cluster
      cluster: { pencolor: attr<string>() },
    });
    // A built-in attribute of another kind is a new one here.
    defineSchema({ node: { rankdir: attr<string>() } });
  });

  it('takes only the parts and value types of a schema', () => {
    // @ts-expect-error not a part of a schema
    defineSchema({ nodes: {} });
    // @ts-expect-error not a value type
    defineSchema({ types: { colour: values.extend<'x'>() } });
    // @ts-expect-error a value type takes values, not attr
    defineSchema({ types: { color: attr<'x'>() } });
    // @ts-expect-error cluster cannot be changed
    defineSchema({ subgraph: { cluster: attr.override<'yes'>() } });
  });
});

describe('a kit with a schema', () => {
  it('creates the models of the schema', () => {
    const kit = createModelKit({ schema });
    expectTypeOf(kit).toEqualTypeOf<
      ModelKit<
        import('ts-graphviz').ResolvedModelTypes<{
          readonly schema: MySchema;
        }>
      >
    >();
    expectTypeOf(kit.schema).toEqualTypeOf<MySchema>();
    expectTypeOf(kit.createNode('a')).toEqualTypeOf<NodeModel<MySchema>>();
    kit.createNode('a', { label: 1, 'data-id': 2, color: 'brand-blue' });
    // @ts-expect-error the schema makes a node's label a number
    kit.createNode('a', { label: 'A' });
    expectTypeOf(kit.createEdge(['a', 'b'])).toEqualTypeOf<
      EdgeModel<MySchema>
    >();
  });

  it('takes the classes of the schema only', () => {
    const kit = createModelKit({ schema, Node: MyNode });
    expectTypeOf(kit.createNode('a')).toEqualTypeOf<MyNode>();
    class PlainNode extends Node {}
    // @ts-expect-error a class of the models of no schema
    createModelKit({ schema, Node: PlainNode });
    // @ts-expect-error a class of the models of a schema, without one
    createModelKit({ Node: MyNode });
    // @ts-expect-error the same with withModelKit
    withModelKit({ schema, Node: PlainNode });
  });

  it('gives DSLs of the schema from withModelKit', () => {
    const { digraph } = withModelKit({ schema });
    const G = digraph('G', { hoge: 'x' }, (g) => {
      expectTypeOf(g.hoge).toEqualTypeOf<string | undefined>();
      const a = g.node('a', { 'data-id': 1, label: 2 });
      expectTypeOf(a.label).toEqualTypeOf<number | undefined>();
      expectTypeOf(a.color).toEqualTypeOf<
        Attribute<'color'> | 'brand-blue' | undefined
      >();
      // @ts-expect-error a number is expected
      g.node('b', { 'data-id': 'x' });
      g.subgraph('cluster_a', { team: 'core' });
      g.edge(['a', 'b'], { dir: 'sideways' });
    });
    expectTypeOf(modelOf(G)).toEqualTypeOf<RootGraphModel<MySchema>>();
    // @ts-expect-error not an attribute of the schema's graphs
    digraph('G', { 'data-id': 1 });
  });

  it('keeps the classes in the DSL', () => {
    const { digraph } = withModelKit({ schema, Node: MyNode });
    digraph((g) => {
      expectTypeOf(modelOf(g.node('a')).extra()).toEqualTypeOf<string>();
      expectTypeOf(g.node('a').label).toEqualTypeOf<number | undefined>();
    });
  });

  it('converts DOT to the models of the schema', () => {
    const G = fromDot('digraph { a }', { convert: { models: { schema } } });
    expectTypeOf(G).toEqualTypeOf<RootGraphModel<MySchema>>();
    const a = fromDot('a', {
      parse: { as: 'Node' },
      convert: { models: { schema, Node: MyNode } },
    });
    expectTypeOf(a).toEqualTypeOf<MyNode>();
    const D = fromDot('digraph { a }', {
      convert: { models: { schema } },
      dsl: true,
    });
    expectTypeOf(D).toEqualTypeOf<
      DSL<
        RootGraphModel<MySchema>,
        import('ts-graphviz').ResolvedModelTypes<{
          readonly schema: MySchema;
        }>
      >
    >();
    expectTypeOf(dsl(G, createModelKit({ schema }))).toExtend<
      DSL<RootGraphModel<MySchema>, ModelTypes<MySchema>>
    >();
  });
});

describe('fromDot with classes of another schema', () => {
  class PlainNode extends Node {}

  it('does not compile', () => {
    fromDot('a', {
      parse: { as: 'Node' },
      // @ts-expect-error a class of no schema with a schema
      convert: { models: { schema, Node: PlainNode } },
    });
    fromDot('digraph { a }', {
      // @ts-expect-error a class of a schema without one
      convert: { models: { Node: MyNode } },
      dsl: true,
    });
    fromDotAll('digraph { a }', {
      // @ts-expect-error the same with fromDotAll
      convert: { models: { schema, Node: PlainNode } },
    });
    legacy.fromDot('digraph { a }', {
      // @ts-expect-error the same with ts-graphviz/legacy
      convert: { models: { schema, Node: PlainNode } },
    });
  });
});
