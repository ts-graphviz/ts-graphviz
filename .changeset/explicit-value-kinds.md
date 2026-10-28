---
"@ts-graphviz/common": major
"@ts-graphviz/ast": major
"@ts-graphviz/react": major
"@ts-graphviz/core": major
"ts-graphviz": major
---

Make attribute value kinds explicit and escape literal text completely

A plain `string` in a model is **literal text**: `toDot` escapes it completely (`\` → `\\`, `"` → `\"`, newlines → `\n` / `\r`) and `fromDot` gives the same text back. In 3.x, a backslash in a string was passed through, so `\N` or `\l` kept their Graphviz meaning, and a string shaped like `<…>` with balanced brackets was written as an HTML-like label; in v4 both are plain text.

Values that carry DOT syntax of their own are explicit:

- `escString('\\N\\lleft')` — a Graphviz escString, written as is so `\N`, `\G`, `\l`, … keep their meaning (only `"` is escaped).
- `htmlLike('<b>bold</b>')` — an HTML-like label; `renderHTMLLike` in `@ts-graphviz/react` now returns this value instead of a `<…>` string.
- `isEscString` / `isHTMLLike` type guards; `EscString` and `HTMLLikeLabel` types are updated accordingly. The guards, and so `toDot`, recognise only values made by `escString()` / `htmlLike()`, which mark them with a non-enumerable property keyed by a registered symbol (`Symbol.for`), shared by two copies of the package. An object built with the same fields, or a value that went through JSON, is written as a plain string; rebuild such values with `escString()` / `htmlLike()`. `toDot` reads the markup of an `htmlLike` value once and writes exactly what it checked; markup that is not a string is rejected (`RangeError`, `TSG_ERR_INVALID_HTML_LIKE`).

Parsing maps back the same way: `\\` and `\"` become literal characters, any other backslash sequence yields an `escString`, and `<…>` yields `htmlLike`.

Migration:

- `label: 'line1\\nline2'` (a literal backslash-n to get a line break) → `label: 'line1\nline2'` (a JS newline) or `escString('line1\\nline2')`.
- `label: '<<b>bold</b>>'` → `label: htmlLike('<b>bold</b>')`.
- Code that used the string returned by `renderHTMLLike` → use `.value` (the markup without the outer brackets) or pass the value to an attribute directly.

AST: a quoted `Literal` holds the raw source text with escape sequences intact, and `stringify` writes it back verbatim, including a raw newline inside a quoted or HTML string, which gets no indentation (3.x wrote it as `\n`); escaping happens in the model ⇄ AST conversion.
