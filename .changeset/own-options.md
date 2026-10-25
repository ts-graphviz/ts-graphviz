---
"@ts-graphviz/common": major
"@ts-graphviz/ast": major
"@ts-graphviz/adapter": major
"ts-graphviz": major
"@ts-graphviz/react": minor
---

Options are read from their own properties only, so a polluted `Object.prototype` (from a bug elsewhere in the application) no longer changes what ts-graphviz does (#1757). Before, `Object.prototype.dotCommand = '/bin/sh'` made the adapter run `/bin/sh`, `Object.prototype.sanitize = false` turned the source check off, and inherited `library`, `attributes`, parse limits, `startRule`, `policy`, `print` and `convert` options were used as well.

- Every public entry point (`toStream` / `toFile`, `parse` / `parseFragment`, `sanitize`, `stringify`, `fromModel` / `toModel`, `createElementFactory`, `fromDot` / `fromDotAll`, `toDot`, react's `createRoot` / `renderToDot` / `renderHTMLLike`) reads its options, and the option objects nested in them, through `ownOptions`, new in `@ts-graphviz/common`.
- `ERROR_CODES` and `DEPRECATION_CODES` are frozen.
- The security model has a new boundary, SM-8, for state shared by the process.

An option given through a prototype (an options object made with `Object.create(defaults)` or a class instance with getters) is no longer read; pass a plain object with own properties.
