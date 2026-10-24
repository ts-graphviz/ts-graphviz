---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
"@ts-graphviz/ast": major
"ts-graphviz": major
---

Replace the mutable `RootModelsContext` singleton with an explicit default context

- `@ts-graphviz/common` now only defines the `ModelsContext` interface. `RootModelsContext` (a sealed object of `null`s that was filled in by an import side effect) and `createModelsContext` are gone from it.
- `@ts-graphviz/core` exports `defaultModelsContext()` (the core classes, frozen, built on first use) and `createModelsContext(partial)` (overrides on top of the defaults). `registerDefault()` is removed: importing `ts-graphviz` no longer mutates shared state, and the core classes work without it.
- The constructor types in `ModelsContext` no longer carry a `new (...args: any[])` overload; the real signatures are used, so a class with an incompatible constructor is now a type error.
- `@ts-graphviz/ast`: `toModel(ast, options)` requires `options.models: ModelsContext`, since the AST package has no model classes of its own. Pass `defaultModelsContext()` or `createModelsContext({...})` from `@ts-graphviz/core`.
- `ts-graphviz`: `fromDot(dot, { convert: { models } })` still takes a partial context and fills in the defaults; `withContext()` is unchanged.
- `graph.with(models)` merges the given classes over the graph's current context instead of replacing the whole context.
- A direct subclass of `GraphBase` resolves its default context through the protected `defaultModels()` method; override it or call `with()` before creating models (otherwise an `Error` with `code: 'TSG_ERR_NO_MODELS_CONTEXT'` is thrown). `Graph`, `Digraph` and `Subgraph` do this already.
