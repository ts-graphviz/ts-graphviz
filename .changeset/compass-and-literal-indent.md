---
"@ts-graphviz/ast": patch
---

Fix compass points in the parser and raw newlines in the printer

- Two-letter compass points (`ne`, `nw`, `se`, `sw`) were split into a one-letter compass point and a new statement; `c` and `_` were rejected; and `a:n` was read as a port named `n` instead of a compass point. The grammar now matches Graphviz: `node:compass`, `node:port:compass`, all ten compass points, and `a:p:nx` is a syntax error rather than two statements.
- A raw newline inside a quoted or HTML string literal received the printer's indentation on `stringify`, so `parse(stringify(ast))` was not a round trip. Literal text is now written verbatim.
