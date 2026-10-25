---
"@ts-graphviz/ast": minor
"@ts-graphviz/adapter": major
"@ts-graphviz/common": minor
"ts-graphviz": major
---

Render untrusted DOT safely: `sanitize`, on by default in the adapter (#1681)

- New `sanitize(dot, options?)` in `@ts-graphviz/ast` (and `ts-graphviz/ast`): parses the source with the parser limits, checks it on the AST and returns the DOT printed from the checked AST, so Graphviz reads exactly what was checked. It rejects what makes Graphviz read a file (`image`, `shapefile`, `imagepath`, `fontpath`, `stylesheet`, xdot drawing programs, `<IMG>` / `SRC`), unsafe links (URL attributes and `HREF` other than relative, `http`, `https` and `mailto`, or with whitespace, control characters or backslash escapes), and values Graphviz writes raw into PostScript, image maps, `plain`, JSON or XML output (font names other than plain names, unknown `style` values, non-name shapes, colors with whitespace, control characters, line breaks in names, ports and `comment`, undefined named references outside labels and tooltips). Every check runs at every level of character-reference decoding. With `options.format`, it applies that format's rules (single-word font names for PostScript) and rejects `ismap` and unchecked formats. Rejections are a `DOMException` named `SecurityError` with code `TSG_ERR_UNSAFE_DOT`.
- **Breaking:** `toStream` / `toFile` of `@ts-graphviz/adapter` (and `ts-graphviz/adapter`, for DOT and models) run `sanitize` by default and render its output. The adapter passes its `format`, so `ismap` and formats whose output has not been checked (e.g. `vml`, `fig`) are refused unless `sanitize: false`. Unsafe DOT rejects before the command starts, and DOT that does not parse rejects with `DotSyntaxError` rather than a `CommandExecutionError`. Pass `sanitize: false` for DOT you trust (e.g. your own images), or parser limits as `sanitize: { … }`. `@ts-graphviz/adapter` now depends on `@ts-graphviz/ast`.
- `withCode()` defines `code` as an own property, so it also tags errors whose prototype has a `code` getter (such as `DOMException`).
