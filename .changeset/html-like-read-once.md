---
"@ts-graphviz/ast": patch
---

`toDot` reads the markup of an HTML-like value once, and writes exactly what it checked. Before, the markup was read once for the check and again for the output, so a value whose `value` property answered differently on the second read (a getter or a proxy) could have unchecked markup written. Markup that is not a string is rejected (`RangeError`, code `TSG_ERR_INVALID_HTML_LIKE`) instead of being converted to text.
