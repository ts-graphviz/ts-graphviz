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
- Graphs hold state only. `createNode`, `createEdge`, `createSubgraph` and `with` are removed from `GraphBaseModel` and the core classes, and so is the protected `models` of `GraphBase`: create with a kit or the classes (`new Node('a')`), then add (`g.addNode(node)`), or use the DOT DSL. A graph does not know a kit and holds whatever is added to it, so a `LegacyDigraph` or `LegacyGraph` no longer gives its subgraphs the legacy class: create with `createModelKit(legacyModels)`, or `new LegacySubgraph()`.
