---
"@ts-graphviz/ast": major
---

Fixes from the first fuzzing runs

- **Separate line comments stay separate.** Two `//` (or `#`) comments separated by a blank line were printed on adjacent lines, so parsing the output merged them into one comment. The printer now keeps a blank line between consecutive line comments of the same kind (at the top level, in graph bodies and in attribute lists), and a blank line no longer carries indentation.
- **NUL characters are rejected.** Graphviz stops reading at a NUL character (whatever follows, even inside a comment, is ignored), so `parse` now rejects a source containing one with `DotSyntaxError` instead of reading it differently from Graphviz. A comment containing a NUL is no longer printed with the NUL silently removed; the printer throws a `RangeError` with `code` `TSG_ERR_NUL_CHARACTER`, as it does for other text.
- **Line comments end only at a line feed, as in Graphviz.** `// c\rx -- y` is one comment for Graphviz, but the parser ended the comment at the `\r` and read `x -- y` as an edge; a model comment containing a lone `\r` was printed as a line comment and read back as DOT statements. A `//` or `#` comment now ends only at `\n` (the `\r` of a CRLF line ending is not part of the text).
- **Empty comments are kept.** A comment set to the empty string on a model (e.g. read from a bare `#`) was dropped by `fromModel`; it is now written.
- An empty comment line is printed without trailing whitespace.
