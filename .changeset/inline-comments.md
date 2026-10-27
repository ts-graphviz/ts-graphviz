---
"@ts-graphviz/ast": minor
"ts-graphviz": minor
---

Comments inside statements are parsed and kept in the AST

Graphviz treats a comment as whitespace anywhere (`digraph /* c */ G {`, `a /* c */ -> b`, `color /* c */ = red`, `a // c` + newline + `-> b`); 3.x rejected comments inside statements. They are read and attached to the node next to them, as Prettier, Biome and Ruff do: after a node on the same line → its `trailingComments`; otherwise → the next node's `leadingComments`; in a header with nothing to attach to (`digraph /* c */ {`, `node /* c */ [...]`) → the node's `danglingComments`. These optional properties are on every AST node, and `stringify` writes the comments back (a leading comment on lines of its own, a line comment always ending its line). Comments between statements stay `Comment` statements, as in 3.x. Each attached comment counts toward `maxASTNodes`, like any other node, and comments are attached in one pass over the AST: time linear in the size of the AST plus the number of comments, apart from sorting each node's children.

Model conversion ignores comments inside statements. Unlike 3.x, statement and attribute-list locations do not include the whitespace after a statement without `;`.
