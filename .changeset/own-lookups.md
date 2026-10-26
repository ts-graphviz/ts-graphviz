---
"@ts-graphviz/common": minor
"@ts-graphviz/core": patch
"@ts-graphviz/ast": patch
"@ts-graphviz/react": patch
---

More lookups read own properties only, and attribute list kinds are checked:

- `isTsGraphvizError` counts an error only when `code` is its own property (as `withCode` and the error classes set it), so a `code` inherited from `Object.prototype` does not make a plain object a ts-graphviz error.
- `GraphBase.with` reads the classes it is given from own properties only, and keeps them in a prototype-less object.
- `renderHTMLLike` maps element types through its own table only.
- `GraphBase.addAttributeList` and `stringify` accept only the attribute list kinds `Graph`, `Node` and `Edge`, because the kind is written as a keyword. Anything else throws a `TypeError` with the new code `TSG_ERR_INVALID_ATTRIBUTE_LIST_KIND`.
