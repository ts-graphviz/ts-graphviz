---
"@ts-graphviz/ast": patch
"@ts-graphviz/common": patch
---

`parse` hands the generated parser its options in an object without a prototype, so options of the parser's own (such as its library mode or start position) are never taken from `Object.prototype`. Before, `Object.prototype.peg$library = true` made `parse` return the parser's internal state instead of the AST. The model guards (`isNodeModel`, `isEdgeModel`, `isRootGraphModel`, `isDotModel`, `isForwardRefNode`, …) read `id`, `targets`, `directed` and `graphs` from the object or its classes only, like `$$type`. This is the v4 counterpart of #1797 in 3.x.
