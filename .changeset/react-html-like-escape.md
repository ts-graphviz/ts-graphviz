---
"@ts-graphviz/react": major
---

HTML-like labels: errors are thrown, only HTML-like elements are written, no `dot:port`

`renderHTMLLike` (and so a JSX `label`) returns an `HTMLLikeValue`, the value `htmlLike()` makes. As in 0.12, a text child or an attribute value is written as text, with `&`, `<`, `>` (and `"` in attributes) as entities; markup is written with `dot:` elements (`<dot:b>x</dot:b>`, not the string `'<b>x</b>'`).

- Errors are thrown instead of logged with `console.warn` and replaced by an empty label: a `RangeError` past `maxDepth`; a `TypeError` for a circular tree, an array that contains itself, an element HTML-like labels do not have (`<div>`, …), an attribute name that is not a name, or an object among the children that is not a React element. Errors thrown by components are no longer swallowed.
- `<dot:port>` is removed. HTML-like labels have no port element, and Graphviz rejected its output (`<name>`). Use the `port` attribute of `<dot:table>` / `<dot:td>`.
- Fragments render their children.
- A `bigint` child or attribute value is written as text, as React DOM does (0.12 left it out); React 19 counts `bigint` as a `ReactNode`.
- `dot:*` elements take React's `key` in their types (rendering lists of cells with `map` no longer fails to type-check); `DotElementProps` is exported.
