---
"@ts-graphviz/common": minor
"@ts-graphviz/ast": minor
"ts-graphviz": minor
---

Deprecated uses are reported at run time, once per code: `DEPRECATION_CODES` (`TSG_DEP_…`) and `warnDeprecated(code, message)` in `@ts-graphviz/common` emit a Node.js `DeprecationWarning` where `process.emitWarning` exists (Node.js, Deno, Bun; `--no-deprecation`, `--trace-deprecation` and `--throw-deprecation` apply) and fall back to `console.warn` in browsers. `parse(input, { startRule })` reports `TSG_DEP_PARSE_START_RULE`.
