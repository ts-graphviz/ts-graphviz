---
"@ts-graphviz/ast": major
---

The printer has no depth limit; the parser's nesting limit has a code and a location

- `stringify` (and so `toDot`) prints an AST of any depth, in time linear in the size of the output and without running out of call stack. The `maxNestingDepth` print option of 3.x, past which printing threw a `RangeError`, is removed.
- The `maxNestingDepth` parse option (default 100, a graph's own body counts as 1) is unchanged in meaning: `parse` rejects deeper graph and subgraph bodies with `DotSyntaxError`, which carries the code `TSG_ERR_DOT_SYNTAX` and the location of the first brace that is too deep. The nesting is counted in one pass before parsing, outside strings and comments. Like the other depth limits, it cannot be disabled.
