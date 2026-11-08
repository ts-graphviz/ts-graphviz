---
"@ts-graphviz/common": minor
"@ts-graphviz/core": minor
"ts-graphviz": minor
---

The classes of a models context show in the types. `ModelsContext`, `GraphBaseModel`, `RootGraphModel`, `SubgraphModel`, the model constructor types, `GraphBase` / `RootGraph` / `Subgraph` and `ModelFactory` / `ModelFactories` take an optional type parameter, `ModelTypes`, inferred (`ResolvedModelTypes`) by `createModelsContext`, `withContext`, `createModelFactories` and `fromDot` / `fromDotAll` with `convert.models`. With `withContext({ Node: MyNode })`, `g.node()` gives the DSL of a `MyNode` (`DSL<MyNode>`), in nested `subgraph()` callbacks too. Without custom classes the type parameter changes nothing; what the factories return is the DOT DSL (see that entry).
