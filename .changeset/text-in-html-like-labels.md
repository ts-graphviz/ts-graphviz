---
"@ts-graphviz/react": patch
---

`renderHTMLLike` writes strings as text, as React DOM does: text children and attribute values are written with character references where needed, so a string that already contains a character reference such as `&nbsp;` is written as that literal text (use `' '` instead). Names that are not valid tag or attribute names, and React's `key` / `ref`, are not written. `renderHTMLLike`, `renderToDot` and `createRoot` read their options and props from own properties only.
