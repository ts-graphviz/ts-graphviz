---
"@ts-graphviz/ast": minor
"ts-graphviz": minor
---

New `parseFragment(input, rule, options?)` (beta, low-level API) reads a fragment of a DOT source by grammar rule (`Graph`, `Subgraph`, `Node`, `Edge`, `AttributeList`, `Attribute`, `ClusterStatements`), typed by rule. `parse` is for whole DOT sources; its `startRule` option is deprecated and will be removed in 5.0.
