---
"@ts-graphviz/react": major
---

`renderHTMLLike` (and so a JSX `label`) escapes strings. A text child or an attribute value is written with `&`, `<`, `>` (and `"` in attributes) as entities, so text from users cannot add markup or attributes to an HTML-like label. Before, `title={'x" href="…'}` added an `href`, and `{'</td>'}` closed the cell (#1745).

- Markup is written with `dot:` elements; a string that held markup (`{'<b>x</b>'}`) becomes elements (`<dot:b>x</dot:b>`).
- `<dot:port>` is removed. HTML-like labels have no port element, and Graphviz rejected its output (`<name>`). Use the `port` attribute of `<dot:table>` / `<dot:td>`.
- Errors are thrown instead of logged with `console.warn` and replaced by an empty label: `RangeError` past `maxDepth`; `TypeError` for a circular tree, an element HTML-like labels do not have (`<div>`, …) or an attribute name that is not a name. Errors thrown by components are no longer swallowed.
- Fragments render their children.
- `dot:*` elements take React's `key` in their types (rendering lists of cells with `map` no longer fails to type-check); `DotElementProps` is exported.
