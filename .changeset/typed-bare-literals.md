---
"@ts-graphviz/ast": major
"ts-graphviz": major
---

`toModel` / `fromDot` read bare numerals as numbers and bare `true`/`false` as booleans

A DOT attribute written without quotes, such as `width=1.5` or `fixedsize=true`, now becomes a `number` or `boolean` in the model instead of a string, and is written bare again by `toDot`. This closes the gap where `parse → toModel → fromModel → stringify` turned `width=1.5` into `width="1.5"`. The conversion is applied only when it is exact: a numeral is converted when JavaScript prints the number as the same text, so `001`, `1.`, `.5`, `1.0`, integers beyond 2^53 and numbers that would print in exponent form stay strings and no DOT text changes on the round trip. Any other bare id (`label=foo`) and every quoted string are still strings.
