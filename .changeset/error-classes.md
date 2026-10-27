---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
"@ts-graphviz/ast": major
"@ts-graphviz/adapter": major
"ts-graphviz": major
---

Report errors with standard types and stable `code`s

Every error ts-graphviz raises on purpose is the standard error type that fits the situation, tagged with a `code` from `ERROR_CODES` (exported by `@ts-graphviz/common`, prefix `TSG_ERR_`). The code is the stable contract: messages may change in any release, codes only in a major one. There is no shared custom base class: `instanceof` a library class breaks across realms and duplicated package copies, and class names are rewritten by minifiers.

| Situation | Thrown | `code` |
|---|---|---|
| DOT does not parse, or exceeds a parse limit (`maxInputSize`, `maxASTNodes`, the depth limits) | `DotSyntaxError` (a `SyntaxError`) | `TSG_ERR_DOT_SYNTAX` |
| parser failed otherwise (see `cause`) | `Error` | `TSG_ERR_PARSE_FAILED` |
| an AST built by `fromModel` or a `createElementFactory` builder exceeds `maxASTNodes` | `ASTNodeCountExceededError` (a `RangeError`) | `TSG_ERR_AST_NODE_COUNT_EXCEEDED` |
| edges to subgraphs reach more than `maxEdgeTargets` nodes | `RangeError` | `TSG_ERR_EDGE_TARGET_COUNT_EXCEEDED` |
| null character in text written to DOT | `RangeError` | `TSG_ERR_NUL_CHARACTER` |
| unbalanced HTML-like markup | `RangeError` | `TSG_ERR_INVALID_HTML_LIKE` |
| edge with fewer than two targets, a malformed target or an invalid compass point | `TypeError` | `TSG_ERR_INVALID_EDGE_TARGETS` |
| port containing `:` | `TypeError` | `TSG_ERR_INVALID_PORT` |
| attribute list kind other than `Graph`, `Node`, `Edge` | `TypeError` | `TSG_ERR_INVALID_ATTRIBUTE_LIST_KIND` |
| no converter/printer plugin for a node | `Error` | `TSG_ERR_NO_PLUGIN` |
| `fromDot` on an AST node without a model | `TypeError` | `TSG_ERR_UNCONVERTIBLE_AST` |
| `fromDot` on a source without a graph | `Error` | `TSG_ERR_NO_GRAPH` |
| `fromDot` on a source with several graphs (use `fromDotAll`) | `Error` | `TSG_ERR_MULTIPLE_GRAPHS` |
| `GraphBase` subclass without a models context | `Error` | `TSG_ERR_NO_MODELS_CONTEXT` |
| adapter used in a browser | `Error` | `TSG_ERR_UNSUPPORTED_ENVIRONMENT` |
| Graphviz command failed | `CommandExecutionError` (an `Error`) | `TSG_ERR_COMMAND_FAILED` |
| Graphviz output exceeds `maxOutputSize` | `RangeError` | `TSG_ERR_OUTPUT_LIMIT_EXCEEDED` |
| `sanitize` rejects the DOT | `DOMException` named `SecurityError` | `TSG_ERR_UNSAFE_DOT` |

- `isTsGraphvizError(e)` tells whether a value is one of these errors. It judges by shape (an error whose own `code` is in `ERROR_CODES`), so it works across realms and package copies. Compare `e.code` to narrow further.
- `withCode(error, code)` tags your own errors the same way; it defines `code` as an own property, so it also tags errors whose prototype has a `code` getter (such as `DOMException`).
- `CodedError` and `ErrorCode` type the result. `ERROR_CODES` is frozen.
- `DotSyntaxError` has a `location` (`{ start, end }`; `undefined` for an input over `maxInputSize`). Its `code` and `location` are the contract; the message text and `cause` (the parser's internal error) may change in any release.
- The classes that remain (`DotSyntaxError`, `ASTNodeCountExceededError`, `CommandExecutionError`) set `name` to a literal string.

Compared with 3.x: errors had no `code`; `ASTNodeCountExceededError` extended `Error` and is now a `RangeError`; edge-target errors were a bare `Error` and are now `TypeError`; the browser adapter and the converters threw bare `Error`s; a failed Graphviz command rejected with a bare `Error`.
