---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
"@ts-graphviz/ast": major
"ts-graphviz": major
---

Graphs keep their nodes, edges and subgraphs in the order they were added: `GraphBaseModel.statements` (type `GraphStatementModel`) lists them, and `toDot` writes them in that order after the graph's attributes and default attribute lists, instead of grouping them by kind. Node order affects Graphviz's layout, so `toDot(fromDot(source))` now renders as the source does. Replacing a node by one with the same id keeps its place.
