---
"@ts-graphviz/ast": major
"ts-graphviz": major
---

`stringify` writes a bare `Literal` without quotes only when Graphviz reads it as one ID

A `kind: 'bare'` value is written as it is when it is an identifier that is not a DOT keyword, or a numeral. Any other value in an AST built by hand is written quoted, which Graphviz reads as the same string: a keyword in any case (`edge`, `Node`, `STRICT`), which Graphviz reads as the start of a statement; a numeral followed by letters (`1abc`), which it reads as two IDs; and an identifier with `$`, the empty string or text with spaces or punctuation. A value with a null character throws a `RangeError` with code `TSG_ERR_NUL_CHARACTER`, as a quoted string from a model does. ASTs from `parse` and `fromModel` are printed as before, except that an identifier with `$`, which the parser reads but Graphviz does not, is now quoted.
