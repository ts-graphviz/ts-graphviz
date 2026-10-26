---
"@ts-graphviz/ast": patch
---

`toDot` / `fromModel` write an attribute value or id that is not a string, number, boolean, `escString` or `htmlLike` (an array or object from parsed JSON, say) as its text, escaped like a string. Before, such a value was written between quotes without escaping, so its text could end the string; such an id threw a `TypeError`. A value that `String()` cannot convert still throws the `TypeError` it raises. This matches 3.x since #1763.
