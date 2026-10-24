---
"@ts-graphviz/ast": patch
---

Accept raw newlines inside quoted strings

Graphviz accepts an unescaped newline inside a double-quoted string and keeps it in the value. `parse` now does the same instead of throwing a `SyntaxError`; `stringify` emits the newline as the `\n` escape, which Graphviz renders identically.
