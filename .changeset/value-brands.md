---
"@ts-graphviz/common": patch
---

`isEscString` / `isHTMLLike`, and therefore `toDot`, recognise only values made by `escString()` / `htmlLike()`. Before, any object with `$$kind: 'escString'` or `'html'` and a string `value` counted, including one from parsed JSON, so data could make a value be written raw as an escString or an HTML-like label. The factories now mark their values with a non-enumerable property keyed by a registered symbol (`Symbol.for`), which data cannot carry and two copies of the package share. An object built with the same fields, or a value that went through JSON, is written as a string. Rebuild such values with `escString()` / `htmlLike()`.
