---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
"@ts-graphviz/ast": major
"ts-graphviz": major
---

Replace the mutable `RootModelsContext` singleton with `ModelKit`

- `ModelsContext` is now `ModelKit`: a set of model classes that fit together, and the operations that create models from them. `@ts-graphviz/common` only defines the interface (and `ModelClasses`, the classes alone). `RootModelsContext` (a sealed object of `null`s that was filled in by an import side effect) and `createModelsContext` are gone from it.
- `@ts-graphviz/core` exports `defaultModelKit` (the kit of the core classes, frozen) and `createModelKit(classes)` (a frozen kit of the given classes, with the default ones for the rest).
- A kit creates with `createDigraph`, `createGraph`, `createSubgraph`, `createNode` and `createEdge`. They only create: what they return is in no graph until it is added, and `createEdge` does not add the nodes its targets refer to.
- Custom classes are the way to extend what a kit creates; it has no creation hook. `registerDefault()` is removed: importing `ts-graphviz` no longer mutates shared state, and the core classes work without it.
- The constructor types in `ModelClasses` no longer carry a `new (...args: any[])` overload; the real signatures are used, so a class with an incompatible constructor is now a type error.
- `createModelKit()` with no class that differs from the default ones returns `defaultModelKit` itself.
- `@ts-graphviz/ast`: `toModel` creates graphs, subgraphs and nodes with the kit's `create*` operations. `toModel(ast, options)` requires `options.models: ModelKit`, since the AST package has no model classes of its own. Pass `defaultModelKit` or `createModelKit({...})` from `@ts-graphviz/core`.
- `ts-graphviz`: `fromDot(dot, { convert: { models } })` still takes some of the classes and fills in the defaults; `withContext()` is now `withModelKit()`.
- `graph.with(models)` merges the given classes over the graph's current ones instead of replacing them all.
- A direct subclass of `GraphBase` resolves its default classes through the protected `defaultModels()` method; override it, or give `with()` all six classes before creating models (otherwise an `Error` with `code: 'TSG_ERR_NO_MODELS_CONTEXT'` is thrown, by a `with()` that leaves some out too). `Graph`, `Digraph` and `Subgraph` do this already.
