---
"@ts-graphviz/ast": minor
"ts-graphviz": minor
---

`parseFragment` and `fromDot` take a union of rules. `parseFragment(input, rule)` is one generic signature that returns `FragmentByRule[R]` (new), and `fromDot` is generic over `startRule`, returning `FromDotModel<R>` (new). A union rule such as `'Node' | 'Edge'` gives the union of the results, and a single rule gives the same types as before. Combined with `convert.models`, the result is typed by the custom classes too. (TypeScript ≥ 5.0, for `const` type parameters.)
