---
"@ts-graphviz/common": minor
"@ts-graphviz/core": minor
"ts-graphviz": major
---

A model's name is `nodeId`, `graphId` or `subgraphId`; the DOT DSL gives the members under their own names

- A node's name (its ID in DOT, `a` in `a -> b`) is `nodeId`; a root graph's is `graphId` and a subgraph's `subgraphId`. `id` stays on the models in v4, deprecated, and is removed in v5: on the DOT DSL, `id` is the Graphviz `id` attribute, as are `comment` and `size`.
- `@ts-graphviz/common` exports `ATTRIBUTE_KEYS`, the name of every attribute Graphviz documents, at run time.
- The DOT DSL gives a model's members under their own names (`g.createNode('a')`, `a.nodeId`, `a.getAttribute('label')`) next to the attributes as properties. A member of your own class named like an attribute is reached with a `$` in front (`e.$weight()`); the members deprecated in v4 are left out of the DSL's types (read them on `modelOf(x)`, or with a `$` in front). An attribute a schema adds under a member's name is reached with `getAttribute` / `setAttribute`.
