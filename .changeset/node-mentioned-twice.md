---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
"@ts-graphviz/ast": major
"ts-graphviz": major
"@ts-graphviz/react": major
---

A node or a subgraph can be declared more than once, as in DOT, and each declaration is a model of its own, kept where it is written. Graphviz applies the attributes of the declarations of a node in turn, and merges the contents of the declarations of a subgraph, so the output means the same.

- `fromDot('digraph { a [color=red]; b; a [shape=box] }')` has three node models, `a`, `b` and `a`, each with the attributes of its statement, and `toDot` writes them back the same way. 3.x kept only the last statement of `a` (and lost `color`). A subgraph declared again is a subgraph model of its own too.
- `getNode(id)` and `getSubgraph(id)` are removed. `getNodes(id)` and `getSubgraphs(id)` give every declaration with the id, in order (an empty array when there is none): `getNode('a')` becomes `getNodes('a')[0]` for the first.
- `nodes` lists every declaration, several with one id included, as `subgraphs` does.
- `addNode` with a node whose id the graph has adds another declaration at the end; 3.x replaced the node with the id. Adding a node that is already in the graph changes nothing.
- `removeNode(node)` removes that declaration; `removeNode('a')` removes every declaration with the id `a`.
- `node('a')` and `subgraph('s')` of the DOT DSL always declare a new node or subgraph, with the kit, so what they return is always of the kit's class. To change a node there is, find it with `getNodes`: `dsl(modelOf(g).getNodes('a')[0]).label = 'A'`.
- `@ts-graphviz/react`: each `<Node>` is a declaration of its own, also when two elements, or two roots on one container, have one id, and each takes only its own declaration out.
- The legacy models (`legacyModels`, `ts-graphviz/legacy`) keep 3.x's one node per id: a node added with the id of another takes its place, `fromDot` and the DSL add to the node or subgraph there is, and `getNode` / `getSubgraph` are there, deprecated.
