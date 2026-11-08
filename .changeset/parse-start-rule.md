---
"@ts-graphviz/ast": minor
"ts-graphviz": minor
---

`parse` takes what to read the input as in the `as` option, and its result is typed by it (`ParseResultByRule[R]`): no `as` gives `DotASTNode` (a whole DOT source), `{ as: 'Edge' }` gives `EdgeASTNode`, and a union such as `'Node' | 'Edge'` gives the union of the results. `fromDot` takes it as `parse.as` and returns `FromDotModel<R>`, so a union gives the union of the models; combined with `convert.models`, the result is typed by the custom classes too. (TypeScript ≥ 5.0, for `const` type parameters.)

`startRule`, the 3.x name (a term of the parser generator), keeps working as a deprecated alias and is removed in v5: `parse(s, { startRule: 'Edge' })` → `parse(s, { as: 'Edge' })`, `fromDot(s, { parse: { startRule: 'Node' } })` → `fromDot(s, { parse: { as: 'Node' } })`. When both are given, `as` wins.
