---
"@ts-graphviz/ast": major
---

Fixes from the first fuzzing runs

- **Separate line comments stay separate.** Two `//` (or `#`) comments separated by a blank line were printed on adjacent lines, so parsing the output merged them into one comment. The printer now keeps a blank line between consecutive line comments of the same kind (at the top level, in graph bodies and in attribute lists), and a blank line no longer carries indentation.
- **NUL characters are rejected.** Graphviz stops reading at a NUL character (whatever follows, even inside a comment, is ignored), so `parse` now rejects a source containing one with `DotSyntaxError` instead of reading it differently from Graphviz. A comment containing a NUL is no longer printed with the NUL silently removed; the printer throws a `RangeError` with `code` `TSG_ERR_NUL_CHARACTER`, as it does for other text.
- An empty comment line is printed without trailing whitespace.
