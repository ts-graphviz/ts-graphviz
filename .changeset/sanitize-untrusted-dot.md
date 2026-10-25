---
"@ts-graphviz/ast": minor
"@ts-graphviz/adapter": major
"@ts-graphviz/common": minor
"ts-graphviz": major
---

Render untrusted DOT safely: `sanitize`, on by default in the adapter (#1681)

- New `sanitize(dot, options?)` in `@ts-graphviz/ast` (and `ts-graphviz/ast`): parses the source with the parser limits and rejects what makes Graphviz read a file or write an unsafe link — `image`, `shapefile`, `imagepath`, `fontpath`, `stylesheet`, xdot drawing programs, font names other than plain names, line breaks in names and `comment` (raw in PostScript output), `<IMG>` / `SRC` in HTML-like strings, and URL attributes (`URL`, `href`, `labelURL`, …, `HREF`) other than relative, `http`, `https` and `mailto` or containing whitespace, control characters or backslash escapes — checked at every level of character-reference decoding. It returns the DOT printed from the checked AST, so Graphviz reads exactly what was checked. Rejections are a `DOMException` named `SecurityError` with code `TSG_ERR_UNSAFE_DOT`.
- **Breaking:** `toStream` / `toFile` of `@ts-graphviz/adapter` (and `ts-graphviz/adapter`, for DOT and models) run `sanitize` by default and render its output. Unsafe DOT rejects before the command starts, and DOT that does not parse rejects with `DotSyntaxError` rather than a `CommandExecutionError`. Pass `sanitize: false` for DOT you trust (e.g. your own images), or parser limits as `sanitize: { … }`. `@ts-graphviz/adapter` now depends on `@ts-graphviz/ast`.
- `withCode()` defines `code` as an own property, so it also tags errors whose prototype has a `code` getter (such as `DOMException`).
