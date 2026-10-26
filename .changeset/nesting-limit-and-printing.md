---
"@ts-graphviz/ast": patch
"@ts-graphviz/core": patch
"@ts-graphviz/adapter": patch
"@ts-graphviz/react": patch
---

Bounded work for deeply nested and large graphs, and stricter printing of hand-built ASTs:

- `stringify` / `toDot` indent each line once instead of once per enclosing level, so printing nested graphs no longer slows down sharply with depth.
- `parse` / `fromDot` and `stringify` / `toDot` accept graph and subgraph bodies nested up to `maxNestingDepth` levels (default 100); deeper input throws a `DotSyntaxError` when parsing and a `RangeError` when printing. Raise the limit with the `maxNestingDepth` parse or print option if you need deeper nesting.
- Long edge chains are parsed without recursion; a parse that runs out of stack throws a `DotSyntaxError`.
- `getSubgraph` (and `subgraph(id)`) looks subgraphs up by id in constant time.
- `stringify` writes a literal without quotes only when it is a single identifier or numeral, and as HTML-like text only when its `<` and `>` balance; it rejects unknown attribute list and comment kinds with a `TypeError`, and names an unknown node type without printing the node.
- The shared `createElement` from `@ts-graphviz/ast` no longer counts the nodes it creates; use `createElementFactory` for a limited builder.
- On Deno, `toFile` creates the output file if it is missing and empties it if it exists.
- `renderHTMLLike` renders only React elements (checked with `isValidElement`), and nested arrays of children count toward `maxDepth`.
