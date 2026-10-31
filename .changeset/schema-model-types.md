---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
"ts-graphviz": major
---

The model types take a schema: the attributes and value types of the models of one context

`@ts-graphviz/common` has the types of an attribute schema. A `Schema` lists, for the models typed with it, value types to extend or override (`types`, such as `color`, `style` or `shape`, which changes every attribute that uses them) and attributes to add, extend or override for each kind of object (`graph`, `subgraph`, `cluster`, `node`, `edge`). An attribute entry of a kind applies after `types`. Every value is a `DotValue`: an object of your own is not one. `ValueTypes`, `AttributeValueTypes` and the generated `AttributeValueTypeNames` say which attributes use which value type.

The model types take the schema as a type parameter, `EmptySchema` (no schema) by default:

- `NodeModel<S>`, `EdgeModel<S>`, `DotModel<S>`, `GraphCommonAttributes<S>`, and `RootGraphModel<M>`, `SubgraphModel<M>` and `GraphBaseModel` through `ModelTypes<S>` (`SchemaOf<M>` reads the schema of model types); `Attributes`, `AttributesGroupModel`, `AttributeListModel`, `HasAttributes`, `AttributesObject` and `AttributesEntities` take the attribute types a schema adds or changes (`SchemaAttributeTypes<S, Kind>`), and `NodeAttributesObject`, `EdgeAttributesObject`, `GraphAttributesObject`, the subgraph attribute objects and `SubgraphAttributesFor<Id, S>` take the schema.
- `ModelTypes<S>` has a `Schema` member, and `AnyModelTypes` (the read-only model types) is what every `ModelTypes` is, whatever its schema. `ModelsContext<M>` and the model constructor types take the attributes of the schema.
- The classes of `@ts-graphviz/core` are generic: `Node<S>`, `Edge<S>`, `Dot<S>`, `Digraph<M>`, `Graph<M>`, `Subgraph<M>`, `RootGraph<M>`, `GraphBase<T, K, M>`, the ordered classes and the attribute classes. A class of your own for a schema is `class MyNode extends Node<MySchema> {}`.

A graph of a schema types what it takes and gives with the schema: `node('a', { label: 1 })` where the schema overrides a node's `label` to a number, `get('label')` reads a number back, and `addNode` / `addEdge` / `addSubgraph` take the models of that schema. A model of one schema is not one of another or of none, since an attribute may have another type there; code that only reads models takes the read-only model types (`ReadonlyNodeModel`, …), which the models of every schema fit, and so do `toDot`, `fromModel` and the adapter.

Without a schema the types work as in 3.x. Compared with 3.x:

- `new (directed ? Digraph : Graph)()` no longer compiles, since the classes are generic; type the class as a `RootGraphConstructor` (`const Class: RootGraphConstructor = directed ? Digraph : Graph`).
- A `ModelTypes` written by hand (not extending `ModelTypes`) needs a `Schema` member, and the bound of the model types parameters is `AnyModelTypes`.
- `GraphBaseModel`, `RootGraphModel`, `SubgraphModel` and `ModelsContext` have one more type parameter, the schema (by default that of their model types).
- `get` and `set` of `Attributes` have three overloads: the built-in attributes the schema keeps (`BuiltInAttributeKey`, typed as before), the attributes the schema adds or changes (`SchemaAttribute`), and keys in code generic over the schema (`AttributeOf`). A class that overrides them declares the same overloads.
- `addAttributeList` has an overload for each kind, typed by `AttributeListAttributes<S, Kind>`; without a schema each takes any attributes, as before.

The run-time behaviour is unchanged.
