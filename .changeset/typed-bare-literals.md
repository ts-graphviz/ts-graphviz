---
"@ts-graphviz/ast": major
"ts-graphviz": major
---

`toModel` / `fromDot` read bare numerals as numbers and bare `true`/`false` as booleans

A DOT attribute written without quotes, such as `width=1.5` or `fixedsize=true`, now becomes a `number` or `boolean` in the model instead of a string, and is written bare again by `toDot`. This closes the gap where `parse → toModel → fromModel → stringify` turned `width=1.5` into `width="1.5"`. Any other bare id (`label=foo`) is still a string. Normalization that remains and is documented: `1.0` reads as `1`, `.5` as `0.5`, and a quoted `"1.5"` stays a string.
