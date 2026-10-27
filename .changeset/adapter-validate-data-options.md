---
"@ts-graphviz/adapter": major
"@ts-graphviz/common": minor
"ts-graphviz": major
---

Check the adapter's data options at run time

TypeScript types do not hold at run time, and options such as `format` are often chosen by a request. `toStream` and `toFile` (Node.js and Deno) now check every option that is data before the command starts, and reject a value outside its documented type or range with a `TypeError` or `RangeError` whose `code` is `TSG_ERR_INVALID_OPTION` (new in `ERROR_CODES`):

- `format` must be exactly one of the `Format` names and `layout` one of the `Layout` names. A `:renderer` suffix such as `png:cairo` is no longer passed to Graphviz, and neither is a name added only by merging into `Format.$values` / `Layout.$values`: that changes the type, not what the adapter runs.
- `attributes` must be an object of `graph` / `node` / `edge` records mapping attribute names to strings, finite numbers or booleans. A name that is empty or contains `=` (Graphviz splits the argument at the first `=`) or a NUL character, a value with a NUL character, and an object value (`escString()` / `htmlLike()` cannot be given on the command line) are rejected, also with `sanitize: false`.
- `scale` must be a finite number greater than 0 (a `NaN` was silently ignored); `noop` and `iterations` non-negative integers; `unscaledFactor`, `overlapExpansionFactor` and `temperature` finite, non-negative numbers; `suppressWarnings`, `y`, `reduce`, `grid` and `oldAttractive` booleans (a non-boolean `suppressWarnings` was read as truthy).
- `sanitize` must be a boolean or an options object; in it, `policy` must be `'default'` or `'strict'` (another value fell back to `'default'`) and the parser limits non-negative numbers, finite for the depth limits.
- `dotCommand` and `library` choose code to run, so they stay trusted configuration: they are checked only to be a non-empty string and an array of strings, so a value of another type (such as a `URL`) is rejected instead of being converted.

`maxOutputSize` keeps its own check (`RangeError`, `TSG_ERR_OUTPUT_LIMIT_EXCEEDED`).

New `isFormat(value)` and `isLayout(value)` type guards tell whether a value is one of the names the adapter accepts, to check a format or layout chosen by a request before rendering. They are the only additions; the lists themselves are not exported.
