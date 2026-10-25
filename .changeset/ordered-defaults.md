---
"@ts-graphviz/common": major
"@ts-graphviz/core": minor
"@ts-graphviz/ast": minor
"ts-graphviz": minor
---

Default attribute statements can keep their place. `GraphBaseModel.addAttributeList(kind, attributes)` adds a `node [...]` / `edge [...]` / `graph [...]` statement: the default classes merge it into `attributes` (one set of defaults for the whole graph, as before); the new `orderedModels` (`OrderedGraph`, `OrderedDigraph`, `OrderedSubgraph`) put it into `statements` once something precedes it, so it applies only to what follows, as in DOT. `fromDot(dot, { convert: { models: orderedModels } })` renders `node [color=red]; a; node [color=blue]; b` as Graphviz does.
