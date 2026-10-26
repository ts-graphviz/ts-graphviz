---
"@ts-graphviz/ast": minor
---

Printing is linear and deep nesting fails with a coded error:

- `stringify` prints with a loop and a stack of its own instead of nested generators, which passed every token through one generator per level. Printing time is linear in the size of the output (depth 400 took 5.3 s, now about 5 ms). An AST of any depth prints without running out of call stack; before, depth 800 threw a `RangeError` without a code.
- New `maxNestingDepth` parse option (default 100, a graph's own body counts as 1): `parse` rejects deeper graph and subgraph bodies with `DotSyntaxError` (`TSG_ERR_DOT_SYNTAX`) and the place of the first brace that is too deep. The nesting is counted in one pass before parsing, outside strings and comments. Before, a few thousand levels overflowed the parser's stack and threw a generic `TSG_ERR_PARSE_FAILED`. Like the other depth limits, this one cannot be disabled.
