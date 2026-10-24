---
"@ts-graphviz/common": major
"@ts-graphviz/ast": major
"@ts-graphviz/react": major
"@ts-graphviz/core": major
"ts-graphviz": major
---

Make attribute value kinds explicit and escape literal text completely

A plain `string` in a model is now **literal text**: `toDot` escapes it completely (`\` → `\\`, `"` → `\"`, newlines → `\n` / `\r`) and `fromDot` gives the same text back. This closes a DOT injection in the printer (a value such as `\\"a` could break out of the quoted string) and removes the `/^<.+>$/` guess that turned any string shaped like `<…>` into an HTML label.

Values that carry DOT syntax of their own are explicit:

- `escString('\\N\\lleft')` — a Graphviz escString, written as is so `\N`, `\G`, `\l`, … keep their meaning (only `"` is escaped).
- `htmlLike('<b>bold</b>')` — an HTML-like label; `renderHTMLLike` in `@ts-graphviz/react` now returns this value instead of a `<…>` string.
- `isEscString` / `isHTMLLike` type guards; `EscString` and `HTMLLikeLabel` types are updated accordingly.

Parsing maps back the same way: `\\` and `\"` become literal characters, any other backslash sequence yields an `escString`, and `<…>` yields `htmlLike`.

Migration:

- `label: 'line1\\nline2'` (a literal backslash-n to get a line break) → `label: 'line1\nline2'` (a JS newline) or `escString('line1\\nline2')`.
- `label: '<<b>bold</b>>'` → `label: htmlLike('<b>bold</b>')`.
- Code that used the string returned by `renderHTMLLike` → use `.value` (the markup without the outer brackets) or pass the value to an attribute directly.

AST: a quoted `Literal` now holds the raw source text with escape sequences intact, and `stringify` writes it back verbatim; escaping happens in the model ⇄ AST conversion.
