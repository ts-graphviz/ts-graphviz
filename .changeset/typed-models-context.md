---
"@ts-graphviz/common": minor
"@ts-graphviz/core": minor
"ts-graphviz": minor
---

The classes of a models context show in the types. `ModelsContext`, `GraphBaseModel`, `RootGraphModel`, `SubgraphModel`, the model constructor types, `GraphBase` / `RootGraph` / `Subgraph` and `ModelFactory` / `ModelFactories` take an optional type parameter, `ModelTypes`, inferred (`ResolvedModelTypes`) by `createModelsContext`, `withContext`, `createModelFactories` and `fromDot` / `fromDotAll` with `convert.models`. With `withContext({ Node: MyNode })`, `g.node()` is a `MyNode`, in nested `subgraph()` callbacks too. Types only; code without custom classes sees the same types as before.
