---
"@ts-graphviz/common": minor
"@ts-graphviz/core": patch
"@ts-graphviz/ast": patch
"@ts-graphviz/adapter": patch
"ts-graphviz": patch
"@ts-graphviz/react": patch
---

Options, props and optional fields are read from the objects that own them

What ts-graphviz does never depends on properties inherited from `Object.prototype`:

- Every public entry point (`toBlob`, `parse` / `parseFragment`, `sanitize`, `stringify`, `fromModel` / `toModel`, `createElementFactory`, `fromDot` / `fromDotAll`, `toDot`, `GraphBase.with`, react's `createRoot` / `renderToDot` / `renderHTMLLike` and components) reads its options or props, and the option objects nested in them, from own properties only. An option given through a prototype (an options object made with `Object.create(defaults)` or a class instance with getters) is not read; pass a plain object with own properties. The helper that does this, `ownOptions`, is exported by `@ts-graphviz/common`.
- Optional fields of AST nodes and edge targets (ids, ports, compass points, comment arrays) are read only when the object has them, and the model type guards (`isNodeModel`, `isEdgeModel`, `isRootGraphModel`, `isDotModel`, `isForwardRefNode`, …) read `$$type`, `id`, `targets`, `directed` and `graphs` from the object or its classes only, so a plain object does not pass for a model. Class-based AST nodes and models keep working.
- The adapter starts the command with options that inherit nothing, and `toBlob` reads the command's output as bytes into a Blob built with prototype-less options.
- `ERROR_CODES` and `DEPRECATION_CODES` are frozen.
