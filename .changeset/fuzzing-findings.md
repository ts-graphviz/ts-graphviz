---
"@ts-graphviz/ast": major
---

Comments and NUL characters are read and written as Graphviz reads them

- **Separate line comments stay separate.** In 3.x, two `//` (or `#`) comments separated by a blank line were printed on adjacent lines, so parsing the output merged them into one comment. The printer keeps a blank line between consecutive line comments of the same kind (at the top level, in graph bodies and in attribute lists), and a blank line carries no indentation.
- **NUL characters are rejected.** Graphviz stops reading at a NUL character (whatever follows, even inside a comment, is ignored), so `parse` rejects a source containing one with `DotSyntaxError` instead of reading it differently from Graphviz. When writing, 3.x silently removed NUL characters from comments and values; v4 throws a `RangeError` with `code` `TSG_ERR_NUL_CHARACTER` instead.
- **Line comments end only at a line feed, as in Graphviz.** `// c\rx -- y` is one comment for Graphviz, but 3.x ended the comment at the `\r` and read `x -- y` as an edge. A `//` or `#` comment ends only at `\n` (the `\r` of a CRLF line ending is not part of the text).
- **Empty comments are kept.** A comment set to the empty string on a model (e.g. read from a bare `#`) was dropped by `fromModel` in 3.x; it is written.
- An empty comment line is printed without trailing whitespace.
