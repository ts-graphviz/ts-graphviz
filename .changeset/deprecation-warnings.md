---
"@ts-graphviz/common": minor
"@ts-graphviz/ast": minor
"ts-graphviz": minor
---

Deprecated uses are reported at run time, once per code (`DEPRECATION_CODES`, `TSG_DEP_…`), without ts-graphviz writing to the console: to listeners registered with `onDeprecation(listener)` on every runtime; on the `ts-graphviz:deprecation` diagnostics channel and through `process.emitWarning` as a `DeprecationWarning` where the runtime has them (Node.js, and runtimes with Node compatibility; `--no-deprecation`, `--trace-deprecation` and `--throw-deprecation` apply). In a browser, only `onDeprecation` listeners receive them. `parse(input, { startRule })` reports `TSG_DEP_PARSE_START_RULE`.
