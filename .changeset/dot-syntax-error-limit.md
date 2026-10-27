---
"@ts-graphviz/ast": minor
"@ts-graphviz/common": patch
---

`DotSyntaxError` has a `limit`: the parse option whose limit the source exceeded (`'maxInputSize'`, `'maxASTNodes'`, `'maxNestingDepth'`, `'maxHtmlNestingDepth'` or `'maxEdgeChainDepth'`), or `undefined` for any other syntax error. Every DOT the parser refuses keeps the one code `TSG_ERR_DOT_SYNTAX`, and now an application can tell a source that is too large or too deep from one that does not parse without reading the message or `cause`. This holds for `parse`, `parseFragment`, `fromDot`, `sanitize` and the adapter's check. The new type `DotSyntaxLimit` lists the values.
