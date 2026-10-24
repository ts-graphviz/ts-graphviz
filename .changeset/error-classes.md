---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
"@ts-graphviz/ast": major
"@ts-graphviz/adapter": major
"ts-graphviz": major
---

Report errors with standard types and stable `code`s

Every error ts-graphviz raises on purpose is now the standard error type that fits the situation, tagged with a `code` from `ERROR_CODES` (exported by `@ts-graphviz/common`, prefix `TSG_ERR_`). The code is the stable contract; messages may change in any release. There is no shared custom base class: `instanceof` a library class breaks across realms and duplicated package copies, and class names are rewritten by minifiers.

| Situation | Thrown | `code` |
|---|---|---|
| DOT does not parse | `DotSyntaxError` (a `SyntaxError`) | `TSG_ERR_DOT_SYNTAX` |
| parser failed otherwise (see `cause`) | `Error` | `TSG_ERR_PARSE_FAILED` |
| AST exceeds `maxASTNodes` | `ASTNodeCountExceededError` (now a `RangeError`) | `TSG_ERR_AST_NODE_COUNT_EXCEEDED` |
| null character in text | `RangeError` | `TSG_ERR_NUL_CHARACTER` |
| unbalanced HTML-like markup | `RangeError` | `TSG_ERR_INVALID_HTML_LIKE` |
| edge with fewer than two or malformed targets | `TypeError` | `TSG_ERR_INVALID_EDGE_TARGETS` |
| no converter/printer plugin for a node | `Error` | `TSG_ERR_NO_PLUGIN` |
| `fromDot` on an AST node without a model | `TypeError` | `TSG_ERR_UNCONVERTIBLE_AST` |
| `fromDot` on a source without a graph | `Error` | `TSG_ERR_NO_GRAPH` |
| `GraphBase` subclass without a models context | `Error` | `TSG_ERR_NO_MODELS_CONTEXT` |
| adapter used in a browser | `Error` | `TSG_ERR_UNSUPPORTED_ENVIRONMENT` |
| Graphviz command failed | `CommandExecutionError` (an `Error`) | `TSG_ERR_COMMAND_FAILED` |

Use `isTsGraphvizError(e)` (shape-based, works across realms) or compare `e.code`; `withCode()` tags your own errors the same way. The classes that remain set `name` to a literal string. Compared with 3.x: edge-target errors were a bare `Error` and are now `TypeError`; the browser adapter and the converters threw bare `Error`s without a code.
