---
"@ts-graphviz/ast": patch
"@ts-graphviz/common": patch
---

More optional fields are read only from the object itself or its classes, never through `Object.prototype` alone, so nothing on `Object.prototype` changes the output (class-based AST nodes and models keep working):

- `parse` gives each node its own comment arrays; an inherited array was shared, so a comment showed up on every node.
- `stringify` writes only the comments and the graph or subgraph id a node has.
- `toModel` / `fromDot` read only the id a graph or subgraph has.
- `sanitize` walks only objects that have a `type`, and reads its own state and options.
- The `is*Model` guards read `$$type` from the object or its classes, never from `Object.prototype`, so a plain object does not pass for a model.
