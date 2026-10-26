---
"@ts-graphviz/ast": patch
---

Comment text reads back the same after `stringify` in more cases:

- A block comment written with CRLF line breaks (`endOfLine: 'crlf'`) reads back with `"\n"` line breaks. Before, its text kept the `"\r"`, so `stringify(parse(dot))` changed it on every round.
- A lone `"\r"` in a comment attached to a node (leading, trailing or dangling) is written as a line break, as it already is in a comment statement.
- A comment with very many lines no longer fails with `TSG_ERR_PARSE_FAILED`: the indentation is measured with a loop instead of `Math.min(...)` (3.x does the same since #1763).

The `value` of a `Comment` node now documents what `parse` normalises: the comment markers, whitespace at the start and end of the text, the indentation that every line after the first shares, and CRLF line breaks.
