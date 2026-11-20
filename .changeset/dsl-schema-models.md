---
"ts-graphviz": major
---

The DOT DSL of a model of a schema, typed with the schema

`dsl()` takes the models of any schema, and their DSL is typed with it: the attributes are properties of the schema's types (`a.label` is a `number` where the schema overrides a node's `label` to one, `a['data-id']` exists where it adds that attribute), and `node`, `edge`, `subgraph` and `graph` take the schema's attributes and give the DSLs of its models.

```ts
const g = dsl(new Digraph<MySchema>());
const a = g.node('a', { label: 1, 'data-id': 2 });
a.label; // number | undefined
g.node('b', { label: 'B' }); // type error: a number is expected
```

- `DSL<T, M>` takes any model that writes (`DSLModel`: it writes its comments and attributes), of any schema; a read-only model (`ReadonlyNodeModel`, …) has none. `M`, the model types of the kit, is by default those of the default classes typed with the model's schema (`DefaultModelTypesOf<T>`: `ModelTypes` without a schema), and is bounded by `DSLModelTypes`.
- The kit given to `dsl(graph, kit)` is of the graph's schema: a kit of another schema, or of none for a graph of a schema, is a type error. Without a kit, the DSL of a graph of a schema creates the default classes, typed with that schema.
- `SchemaOfModel<T>` gives the schema of a model. The kit types of `ModelFactory`, `ModelFactoryCallback` and `FromDotResult` default to those of the graph's schema, as `DSL`'s do. `NodeDSL`, `EdgeDSL`, `RootGraphDSL`, `SubgraphDSL`, `AttributeListDSL` (with the attribute types a schema adds or changes as a fourth parameter) and the factory types (`ModelFactory`, `ModelFactories`, `FromDotResult`, …) take the models and model types of any schema.

- The models name their schema in a type-only property, `'~schema'` (`HasSchema<S>`, never set at run time; the core classes declare it), which the DSL reads instead of comparing whole models. A class that implements a model interface itself, rather than extending a core class, declares it too (`declare readonly '~schema'?: S;`). A model of one schema is therefore not one of another (unless the one schema's type is assignable to the other's) even where the attributes of its kind are the same: `addEdge` of a graph of one schema takes no edge of another.

Without a schema the types are the same as before. The run-time behaviour is unchanged.
