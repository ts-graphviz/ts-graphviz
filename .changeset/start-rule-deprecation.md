---
"@ts-graphviz/ast": patch
"ts-graphviz": patch
---

Editors show where `startRule` is deprecated, and only there

`parse` reads a whole DOT source; reading a fragment with `parse(source, { startRule })` and a rule other than `'Dot'` is deprecated: use `parseFragment`, since `parse` stops taking such a `startRule` in 5.0. The overloads of `parse` for those rules are now marked deprecated, so editors flag such calls; before, nothing showed at the call. (Options typed with any rule, `ParseOptions<Rule>`, are not flagged.) `fromDot`'s `parse.startRule`, which picks what `fromDot` returns and is not deprecated, no longer shows as deprecated.
