---
"@ts-graphviz/ast": minor
"ts-graphviz": minor
---

`parse` is typed by its `startRule` (`ParseResultByRule[R]`): no `startRule` gives `DotASTNode` (a whole DOT source), `'Edge'` gives `EdgeASTNode`, and a union rule such as `'Node' | 'Edge'` gives the union of the results. The call is the same as in 3.x (`parse(source, { startRule: 'Edge', maxASTNodes })`), and `startRule` is not deprecated.

`fromDot` is generic over its `parse.startRule` and returns `FromDotModel<R>`, so a union of rules gives the union of the models; combined with `convert.models`, the result is typed by the custom classes too. (TypeScript ≥ 5.0, for `const` type parameters.)
