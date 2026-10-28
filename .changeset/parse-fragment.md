---
"@ts-graphviz/ast": minor
"ts-graphviz": minor
---

New `parseFragment(input, rule, options?)` (beta, low-level API) reads a fragment of a DOT source by grammar rule (`Graph`, `Subgraph`, `Node`, `Edge`, `AttributeList`, `Attribute`, `ClusterStatements`). It has one generic signature that returns `FragmentByRule[R]`: a union rule such as `'Node' | 'Edge'` gives the union of the results. `parse` is for whole DOT sources; its `startRule` option is deprecated and will be removed in 5.0.

`fromDot` is generic over its `parse.startRule` and returns `FromDotModel<R>`, so a union of rules gives the union of the models; combined with `convert.models`, the result is typed by the custom classes too. (TypeScript ≥ 5.0, for `const` type parameters.)
