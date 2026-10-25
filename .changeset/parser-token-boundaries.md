---
"@ts-graphviz/ast": major
"ts-graphviz": major
---

The parser draws token boundaries as Graphviz does

- A numeral ends where letters start: `1image="x"` is node `1` and the graph attribute `image="x"`, as Graphviz reads it (with a "badly delimited number" warning). It used to be one attribute named `1image`, which hid `image`, `stylesheet` and the like from `sanitize`.
- Keywords (`strict`, `graph`, `digraph`, `subgraph`, `node`, `edge`, in any case) are never bare IDs, and only whole words are keywords: `subgraph;` is an error as in Graphviz, `subgraphx` is an ID. `a -> subgraph s { b }` used to become nodes named `subgraph` and `s`.
- Newlines may separate header tokens (`subgraph cluster_a` + newline + `{`), which used to read the `subgraph` keyword as a node and lose the cluster.
