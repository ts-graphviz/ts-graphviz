---
"@ts-graphviz/ast": patch
---

Limit options keep their default limit when given a value they cannot use. Before, `NaN` (from failed number parsing, say) removed the limit of `maxNestingDepth`, `maxHtmlNestingDepth`, `maxEdgeChainDepth`, `maxASTNodes`, `maxInputSize` and `maxEdgeTargets`, and so did a negative number for the last three and `Infinity` for the depth limits. Now:

- the depth limits (`maxNestingDepth`, `maxHtmlNestingDepth`, `maxEdgeChainDepth`), which cannot be disabled, use the option only when it is a finite, non-negative number;
- `maxASTNodes`, `maxInputSize` and `maxEdgeTargets` use it when it is a non-negative number, so `0` (or `Infinity`) still disables them;

and fall back to the default otherwise.
