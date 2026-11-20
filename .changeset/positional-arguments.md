---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
"@ts-graphviz/ast": major
"ts-graphviz": major
"@ts-graphviz/react": minor
---

Arguments are read by position, and a root graph takes `strict` in options

The constructors of `Digraph`, `Graph` and `Subgraph`, the kit's `createDigraph`, `createGraph` and `createSubgraph`, the factories (`digraph`, `graph`, `strict.*`, `withModelKit().*`) and the DSL's statements (`node`, `edge`, `subgraph`, `graph`) read their arguments by position, in the order of their signatures, each of which may be left out (`undefined` or `null` holds a place). 3.x found them by type, so it took them in any order and dropped extra ones: `digraph('G', 'H')` made the graph `G`. A call that fits none of the signatures now throws a `TypeError` with the new code `TSG_ERR_INVALID_ARGUMENTS`; so do `node()`, `edge()` and `graph()` of the DSL given no arguments they take, which returned `undefined`. TypeScript already rejected these calls.

A root graph's constructor and `createDigraph` / `createGraph` take a new `RootGraphOptions` object after the id: `new Digraph('G', { strict: true })` (see the entry on graph attributes, which removes the attributes argument). Options with another property than `strict` throw `TSG_ERR_INVALID_ARGUMENTS`, so attributes put there are not lost. `fromDot`, `toModel`, the factories and `@ts-graphviz/react` create graphs with the options form (`createDigraph(id, { strict })`), so a class of your own that overrides the constructor of `Digraph` or `Graph`, or a kit whose `createDigraph` / `createGraph` you wrote, receives the options as the second argument instead of a boolean.
