---
"@ts-graphviz/ast": patch
---

Fix two edge cases found by property-based tests

- `fromModel` dropped a graph or subgraph id that is the empty string (`""` is a valid DOT id).
- `stringify` threw a bare `Error` for an empty `Dot` node; it now returns the empty string.
