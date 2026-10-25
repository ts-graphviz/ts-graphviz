---
"@ts-graphviz/ast": major
"@ts-graphviz/common": major
"ts-graphviz": major
---

Edge targets are what Graphviz has: node references, comma lists and subgraphs

- `EdgeTargetASTNode` is `NodeRefASTNode` (`a:p`), the new `NodeRefListASTNode` (`a:p, b`, a comma list that keeps ports) or `SubgraphASTNode` (`{ a b }` or `subgraph s { ... }` with any statements, reaching every node in it). `NodeRefGroupASTNode` is removed and `ASTType` has `'NodeRefList'` instead of `'NodeRefGroup'`: `{a b}` parses as an anonymous `Subgraph` of `Node` statements, matching Graphviz, which ignores ports written inside braces.
- **Fix:** `toDot` wrote a model group with ports as `{a:p b}`, and Graphviz dropped the ports. A group with a port or compass point is now written `a:p, b`; groups without ports are still `{a b}`.
- The parser reads subgraphs and comma lists as edge targets (`subgraph s { a } -> b`, `{ rank=same; a b } -> c`, `a, b -> c`) and comma node statements (`a, b [shape=box];`). `fromDot` turns a subgraph target into a model subgraph and the edge's group of its nodes, as Graphviz does; `{a b}` stays a plain group. A port in a node statement is accepted and dropped, as in Graphviz.
- The location of an edge without `;` ends at its last target instead of including the whitespace after it.
