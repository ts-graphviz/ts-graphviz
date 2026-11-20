---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
"@ts-graphviz/ast": major
"ts-graphviz": major
"@ts-graphviz/react": minor
---

A graph or subgraph takes no attributes as an argument

DOT has no attribute list on a graph's or subgraph's header: a graph's attributes are statements of its body (`rankdir = LR;`), which a graph's attributes now are in the models too. The attributes argument is removed from:

- the constructors of `Digraph`, `Graph` and `Subgraph` (and of the legacy classes): `new Digraph(id?, options?)`, `new Digraph(options)`, `new Subgraph(id?)`;
- the kit's `createDigraph(id?, options?)`, `createGraph(id?, options?)` and `createSubgraph(id?)`, and the `RootGraphConstructor` / `SubgraphConstructor` types;
- the factories: `digraph(id?, callback?)`, `graph(...)`, `strict.*`, `withModelKit().*`, and those of `ts-graphviz/legacy`;
- the DSL's `g.subgraph(id?, callback?)`.

Write the attributes in the body: `digraph('G', (g) => { g.rankdir = 'LR'; ... })`, `g.subgraph('cluster_a', (s) => { s.label = 'A'; ... })`, or on a model `g.setAttribute('rankdir', 'LR')`. The DOT written is the same. Nodes and edges keep their attributes argument. A root graph takes `strict` in options after its id: `new Digraph('G', { strict: true })`.

3.x's boolean `strict` argument (`new Digraph('G', true, attributes)`, `new Digraph(true)`), which was to be deprecated, is removed instead: it came before the attributes, whose place is gone, so no call with it would mean what it did. Every removed form throws a `TypeError` with code `TSG_ERR_INVALID_ARGUMENTS`. `@ts-graphviz/react`'s `<Digraph>`, `<Graph>` and `<Subgraph>` keep their attribute props, applied as the graph's attribute assignments.
