---
"@ts-graphviz/ast": major
"ts-graphviz": major
---

`parse(source, options?)` reads a whole DOT source and `parse(source, rule, options?)` a fragment; 3.x's signature is `parseLegacy`

`parse` takes the grammar rule as its second argument and the parse limits as its third: `parse(source)` reads a whole DOT source (`'Dot'`, a `DotASTNode`), and `parse(source, 'Edge')` reads one edge (`Graph`, `Subgraph`, `Node`, `Edge`, `AttributeList`, `Attribute`, `ClusterStatements`). It has one generic signature that returns `FragmentByRule[R]`: a union rule such as `'Node' | 'Edge'` gives the union of the results.

Compared with 3.x:

- `parse(source)` and `parse(source, { maxASTNodes })` read a whole DOT source as in 3.x. `parse(source, { startRule: 'Edge', maxASTNodes })` becomes `parse(source, 'Edge', { maxASTNodes })`: options with an own `startRule` (in the second or the third argument) throw a `TypeError` with code `TSG_ERR_INVALID_PARSE_ARGUMENTS` that names both forms, as does a second argument that is neither a grammar rule name nor an options object. An inherited `startRule` is ignored, as every inherited option is.
- `parseLegacy(source, options?)` keeps 3.x's signature (`startRule` among the options, `ParseOptions`) for code that cannot move yet. It is deprecated in its types (editors flag it; nothing is reported at run time) and is removed in 5.0.

`fromDot`'s `parse.startRule` is unchanged: it picks the model `fromDot` returns, takes the limits beside it, and is not deprecated. `fromDot` is generic over it and returns `FromDotModel<R>`, so a union of rules gives the union of the models; combined with `convert.models`, the result is typed by the custom classes too. (TypeScript ≥ 5.0, for `const` type parameters.)
