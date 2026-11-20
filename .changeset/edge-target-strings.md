---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
"ts-graphviz": major
---

A string edge target that does not parse completely throws instead of losing a part

`toNodeRef`, and with it every edge created from string targets (`g.edge(['a:p:n', 'b'])`, `createEdge`, and the `targets` of `@ts-graphviz/react`'s `<Edge>`), reads a string as `id`, `id:port`, `id:compass` or `id:port:compass`. A string with more than three `:`-separated parts, or whose third part is not one of the ten compass points, now throws a `TypeError` with code `TSG_ERR_INVALID_EDGE_TARGETS` when the edge is created. 3.x dropped the rest: `'a:b:c:d'` was `a:b:c` (or `a:b` when `c` is not a compass point), and `'a:p:north'` was `a:p`.

Give an id that contains `:` as an object (`{ id: 'a:b' }`), and a port or compass point with `node.port(...)` or `{ id, port, compass }`. An empty port is kept (`'a:'`, `'a::n'`); an empty third part (`'a::'`, `'a:p:'`) throws.
