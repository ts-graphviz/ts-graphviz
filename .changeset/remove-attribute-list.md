---
"@ts-graphviz/common": major
"@ts-graphviz/core": minor
"ts-graphviz": minor
---

`removeAttributeList(list)` takes out a default attribute statement

A graph or subgraph's `removeAttributeList(list)` takes a list that `addAttributeList` returned (in the DOT DSL, `modelOf(g.node({...}))` and the like) out of `statements`, as `removeNode`, `removeEdge` and `removeSubgraph` do for theirs. A leading list (one added before any other statement, and every one with the deprecated `legacyModels` classes) stays the graph's, so it is emptied instead, its attributes and comments, and writes nothing (the leading statements of a kind are one list, so all of them). Anything else is left as it is. `GraphBaseModel` has the method, so a class that implements the interface itself needs it too.
