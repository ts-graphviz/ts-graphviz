---
"@ts-graphviz/ast": patch
---

Node references and comments are written as they are given:

- `stringify`, `toModel`, `fromModel` and `sanitize` use a node reference's `port` and `compass` only when the object owns them. A parsed `a -> b` does not have the fields, and a model target such as `{ id: 'a' }` may leave them out; a property inherited from `Object.prototype` is no longer read in their place.
- A carriage return on its own in a comment starts a new comment line, as `\n` and `\r\n` do, because the parser reads it as a line break.
- A comment value that is not a string (a number from parsed JSON, say) is written as its text instead of throwing a `TypeError`.
