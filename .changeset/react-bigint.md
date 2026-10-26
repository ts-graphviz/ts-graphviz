---
"@ts-graphviz/react": patch
---

`renderHTMLLike` (and labels written as JSX) writes a `bigint` child or attribute value as text, as React DOM does, instead of throwing a `TypeError`. React 19 counts `bigint` as a `ReactNode`.
