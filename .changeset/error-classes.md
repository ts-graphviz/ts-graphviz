---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
"@ts-graphviz/ast": major
"@ts-graphviz/adapter": major
"ts-graphviz": major
---

Systematize the error classes

Every error the library raises on purpose is now a `TsGraphvizError` (exported from `@ts-graphviz/common`) with a subclass naming the situation:

- `InvalidModelError` — a model cannot be represented in DOT (e.g. an edge with fewer than two targets; previously a bare `Error`).
- `InvalidValueError` — a value cannot be written to DOT (null character, unbalanced HTML-like markup; previously `RangeError`).
- `ConversionError` — DOT ⇄ AST ⇄ model conversion failed: no plugin for a node, a DOT source without a graph in `fromDot`, an unexpected parser failure (previously bare `Error`s, some without a message).
- `ResourceLimitError` — a configured limit was hit; `ASTNodeCountExceededError` now extends it.
- `UnsupportedEnvironmentError` — the runtime cannot provide a feature (the adapter in a browser).

`DotSyntaxError` keeps extending the built-in `SyntaxError`, as `JSON.parse` does. Code that caught `RangeError` from `htmlLike()` or the printer should catch `InvalidValueError` (or `TsGraphvizError`).
