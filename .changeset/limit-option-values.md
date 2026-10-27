---
"@ts-graphviz/ast": patch
---

A limit option given a value it cannot use keeps its default limit. The depth limits (`maxNestingDepth`, `maxHtmlNestingDepth`, `maxEdgeChainDepth`), which cannot be disabled, use the option only when it is a finite, non-negative number. `maxASTNodes`, `maxInputSize` and `maxEdgeTargets` use it when it is a non-negative number, so `0` (or `Infinity`) disables them. Any other value, such as `NaN` from a failed number conversion or a negative number, falls back to the default.
