---
"@ts-graphviz/ast": minor
"@ts-graphviz/common": minor
---

`toModel` / `fromDot` limit how many nodes edges to subgraphs reach. An edge to a subgraph reaches every node the subgraph has had so far, and a subgraph opened again keeps its nodes, so `subgraph s { nI } -> x` repeated made memory grow with the square of the source's length (300 MB for a 107 kB source). The new `maxEdgeTargets` convert option (default 100 000, `0` disables) counts these node references over the whole conversion. Past it, the conversion throws a `RangeError` with code `TSG_ERR_EDGE_TARGET_COUNT_EXCEEDED`, a new entry in `ERROR_CODES`.
