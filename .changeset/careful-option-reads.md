---
"@ts-graphviz/adapter": patch
"@ts-graphviz/ast": patch
"ts-graphviz": patch
---

Options are read from their own properties only, and values are always written as DOT text:

- `toStream` / `toFile`, `parse`, `stringify`, `fromModel` / `toModel`, `fromDot` and `toDot` read only the options their caller set. `toStream` / `toFile` also pass Node.js only the options and environment they set.
- Attribute keys and values, IDs, ports, compass points and comments are written so that DOT reads them back as the same text. A string of the form `<…>` is written as an HTML-like label only when it is well-formed; otherwise it is written as a quoted string.
- Writing attribute values and reading block comments are faster on large inputs.
