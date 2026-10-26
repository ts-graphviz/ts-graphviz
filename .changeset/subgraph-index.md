---
"@ts-graphviz/core": patch
---

`getSubgraph` and `subgraph(id)` find a subgraph through an index instead of scanning every subgraph, so looking up named subgraphs no longer takes time proportional to their number: creating and finding 20 000 named subgraphs took 4.7 s before (`fromDot` looks one up for every subgraph statement). With several subgraphs of the same id, the first one added is still returned.
