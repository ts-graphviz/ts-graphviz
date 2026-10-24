---
"@ts-graphviz/ast": patch
---

The shared `createElement` no longer counts the nodes it creates across calls, so it does not throw `ASTNodeCountExceededError` after 100,000 nodes in one process. The parser and `fromModel` keep their per-call limits; use `createElementFactory({ maxASTNodes })` to build with a limit (#1624).
