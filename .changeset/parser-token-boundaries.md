---
"@ts-graphviz/ast": major
"ts-graphviz": major
---

The parser draws token boundaries as Graphviz does

- A numeral ends where letters start: `1image="x"` is node `1` and the graph attribute `image="x"`, as Graphviz reads it (with a "badly delimited number" warning). 3.x read it as one attribute named `1image`.
- Keywords (`strict`, `graph`, `digraph`, `subgraph`, `node`, `edge`, in any case) are never bare IDs, and only whole words are keywords: `subgraph;` is an error as in Graphviz, `subgraphx` is an ID. In 3.x, `a -> subgraph s { b }` became nodes named `subgraph` and `s`.
- Newlines may separate header tokens (`subgraph cluster_a` + newline + `{`), which 3.x read as a node named `subgraph`, losing the cluster.
