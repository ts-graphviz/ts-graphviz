---
"@ts-graphviz/ast": patch
---

Comment text reads back the same after `stringify`: a block comment written with CRLF line breaks (`endOfLine: 'crlf'`) reads back with `"\n"` line breaks. In 3.x its text kept the `"\r"`, so `stringify(parse(dot))` changed it on every round. The `value` of a `Comment` node documents what `parse` normalises: the comment markers, whitespace at the start and end of the text, the indentation that every line after the first shares, and CRLF line breaks.
