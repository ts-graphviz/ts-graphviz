---
"@ts-graphviz/ast": major
---

Normalize the AST node shapes

- Leaf nodes (`Literal`, `Attribute`, `Comment`, `NodeRef`) no longer carry an empty `children` array; they extend `ASTBaseNode` directly. `ASTBaseParentNode` is only for the statement containers (`Dot`, `Graph`, `Subgraph`, `Node`, `Edge`, `AttributeList`).
- `NodeRefList`, which replaces 3.x's `NodeRefGroup` (see the edge target changes), holds its node references in `refs` instead of `children`; `createElement('NodeRefList', props, refs)` takes them as the third argument.
- `location` is absent (not `null` as in 3.x) on nodes created outside the parser; the type is `FileRange | undefined` as documented.
- `ASTChildNode<T>` resolves to the `refs` element type for `NodeRefList` and to `never` for leaves.
