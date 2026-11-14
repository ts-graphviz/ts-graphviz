---
"@ts-graphviz/common": minor
"@ts-graphviz/core": minor
"ts-graphviz": minor
---

The classes of a model kit show in the types. `ModelKit`, the model constructor types and `ModelFactory` / `ModelFactories` take an optional type parameter, `ModelTypes`, inferred (`ResolvedModelTypes`) by `createModelKit`, `withModelKit`, `createModelFactories` and `fromDot` / `fromDotAll` with `convert.models`. `DSL<T, M>` takes the kit's model types as its second type parameter, and `ModelFactoryCallback<G, M>` is the type of a factory's callback. With `withModelKit({ Node: MyNode })`, `g.node()` gives the DSL of a `MyNode` (`DSL<MyNode>`), in nested `subgraph()` callbacks too, and so does `dsl(model, kit)` with a kit of `MyNode`. What a graph holds (`nodes`, `getNodes`, …) is typed by the model interfaces, whatever the classes of the kit. Without custom classes the type parameter changes nothing; what the factories return is the DOT DSL (see that entry).
