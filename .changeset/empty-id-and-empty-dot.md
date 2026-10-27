---
"@ts-graphviz/ast": patch
---

Fix two edge cases of empty ids and empty sources

- `fromModel` keeps a graph or subgraph id that is the empty string (`""` is a valid DOT id); 3.x dropped it.
- `stringify` returns the empty string for an empty `Dot` node; 3.x threw a bare `Error`.
