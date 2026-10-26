---
"@ts-graphviz/adapter": patch
"@ts-graphviz/ast": patch
"@ts-graphviz/common": patch
"@ts-graphviz/react": patch
"ts-graphviz": patch
---

More fields are read only from the objects that own them:

- `parse` passes its options to the generated parser in an object without a prototype.
- Graph and subgraph ids are printed and converted only when the AST node owns them.
- The model type guards (`isNodeModel`, `isForwardRefNode` and the others) read `$$type` and `id` from the object or its classes only.
- The React components and hooks read their props from own properties.
