---
"@ts-graphviz/common": major
"@ts-graphviz/ast": major
"ts-graphviz": major
---

Read-only model types; the code that only reads models takes them

`@ts-graphviz/common` has read-only views of the models: `ReadonlyNodeModel`, `ReadonlyEdgeModel`, `ReadonlySubgraphModel`, `ReadonlyRootGraphModel`, `ReadonlyGraphBaseModel`, `ReadonlyDotModel`, `ReadonlyAttributeListModel`, `ReadonlyAttributes`, the unions `ReadonlyGraphStatementModel` and `AnyReadonlyDotObjectModel`, and `DotValue` (`string | number | boolean | EscStringValue | HTMLLikeValue`, the values an attribute can have). They hold only `readonly` properties, methods that take a string or nothing (`attributes.get(key)`, `getNode(id)`, `isSubgraphCluster()`, …) and read-only results, so every model fits them: the built-in models, the classes of `@ts-graphviz/core` and their subclasses, and model classes of your own.

Compared with 3.x:

- `toDot`, `fromModel` and `FromModelConverter` (`@ts-graphviz/ast`, together with `ConvertFromModelPlugin`), and the model input of `ts-graphviz/adapter`'s `toStream` / `toFile` (`DotInput`) take an `AnyReadonlyDotObjectModel` instead of a `DotObjectModel`. Every model is still accepted; an object that only has a `$$type`, such as `{ $$type: 'Node' }`, no longer compiles.
- Edge targets are read-only references: `NodeRef` is `ReadonlyNodeModel | ForwardRefNode` (3.x: `NodeModel | ForwardRefNode`), since an edge uses only the id of a target node. `edge.targets` holds read-only nodes, and an array of nodes no longer casts to `EdgeTargetTuple` (cast it to a tuple, such as `[NodeModel, NodeModel]`).
- `isNodeModel`, `isEdgeModel`, `isSubgraphModel`, `isRootGraphModel`, `isDotModel` and `isAttributeListModel` narrow a value of unknown type (or a bare `DotObjectModel`) to the read-only type (3.x: the writable model), since they check only `$$type` and a few fields. Given a model, they keep its type: a union of models narrows to its members of that kind, and `models.filter(isNodeModel)` on `AnyDotObjectModel[]` is a `NodeModel[]`.

The run-time behaviour is unchanged. See the v3 to v4 migration guide for how to write a function that takes any node.
