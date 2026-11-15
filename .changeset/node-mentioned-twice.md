---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
"@ts-graphviz/ast": major
"ts-graphviz": major
"@ts-graphviz/react": minor
---

A node or a subgraph can be declared more than once, as in DOT, and each declaration is a model of its own, kept where it is written. Graphviz applies the attributes of the declarations of a node in turn, and merges the contents of the declarations of a subgraph, so the output means the same.

- `fromDot('digraph { a [color=red]; b; a [shape=box] }')` has three node models, `a`, `b` and `a`, each with the attributes of its statement, and `toDot` writes them back the same way. 3.x kept only the last statement of `a` (and lost `color`). A subgraph declared again is a subgraph model of its own too.
- `getNode(id)` and `getSubgraph(id)` are removed. `getNodes(id)` and `getSubgraphs(id)` give every declaration with the id, in order (an empty array when there is none): `getNode('a')` becomes `getNodes('a')[0]` for the first.
- The `nodes`, `edges` and `subgraphs` properties are removed: `getNodes()`, `getEdges()` and `getSubgraphs()` without an id give them, in order, as a new array each time. `getNodes()` lists every declaration, several with one id included, as `getSubgraphs()` does. At run time, `getNodes(undefined)` looks for that id and finds none (TypeScript rejects the call). The read-only graph types change the same way: a read-only graph made by hand has `getNodes()`, `getEdges()` and `getSubgraphs()` in place of the properties.
- `addNode` with a node whose id the graph has adds another declaration at the end; 3.x replaced the node with the id. Adding a node that is already in the graph changes nothing.
- `removeNode(node)` removes that declaration; `removeNode('a')` removes every declaration with the id `a`.
- `node('a')` and `subgraph('s')` of the DOT DSL always declare a new node or subgraph, with the kit, so what they return is always of the kit's class. To change a node there is, find it with `getNodes`: `dsl(modelOf(g).getNodes('a')[0]).label = 'A'`.
- `@ts-graphviz/react`: each `<Node>` is a declaration of its own, also when two elements, or two roots on one container, have one id, and each takes only its own declaration out.
- The legacy models (`legacyModels`) keep 3.x's one node per id: a node added with the id of another takes its place, and `getNode` / `getSubgraph` and the `nodes` / `edges` / `subgraphs` properties are there, deprecated. `fromDot` and the DSL of `ts-graphviz/legacy` add a node or a subgraph declared again to the first one, as 3.x did; `legacyToModel` of the new entry `@ts-graphviz/ast/legacy` (deprecated, removed in v5) converts that way. With `legacyModels` given to `ts-graphviz` itself (`fromDot(dot, { convert: { models: legacyModels } })`), a node declared again replaces the first.
- `@ts-graphviz/react` treats a container of the legacy models like any other: a rendered node takes the place of the container's node with its id, which does not come back when the rendered one goes.
