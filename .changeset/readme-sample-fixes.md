---
"ts-graphviz": patch
"@ts-graphviz/react": patch
"@ts-graphviz/common": patch
"@ts-graphviz/core": patch
---

Fix errors in the README samples and text:

- `ts-graphviz`: the Models Context API sample with `digraph()` passes the graph `G` to `toDot`, not the callback's `g`; the beta badge of `fromDot` renders; the `parse` item reads like its neighbours.
- `@ts-graphviz/react`: the type-safety sample imports `RootGraphProps`, which exists, instead of `DigraphProps`.
- `@ts-graphviz/common`: the node reference sample imports `toNodeRefGroup`, which it calls.
- `@ts-graphviz/core`: "graph elements", not "graph element".
