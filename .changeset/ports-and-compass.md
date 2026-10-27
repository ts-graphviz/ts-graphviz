---
"@ts-graphviz/common": major
"@ts-graphviz/ast": major
"ts-graphviz": major
---

Ports and compass points are read and written as Graphviz reads them

Parsing:

- All ten compass points are accepted (`n`, `ne`, `e`, `se`, `s`, `sw`, `w`, `nw`, `c`, `_`), in `node:compass` and `node:port:compass`. In 3.x, two-letter compass points (`ne`, `nw`, `se`, `sw`) were split into a one-letter compass point and a new statement, `c` and `_` were rejected, and `a:n` was read as a port named `n` instead of a compass point.
- After a port, any ID is accepted as the compass point, as Graphviz does; `dot -Tcanon` output such as `b:"":""` parses. A compass point that is not one of the ten is ignored when converting to a model, as Graphviz ignores it, so `a:p:nx` is port `p` with no compass point.

String edge targets (`'a:p:n'`):

- `isCompass()` accepts `_` ("any side"), so `'a:p:_'` keeps its compass point; 3.x dropped it.
- A lone compass point after the id is the compass point: `'a:n'` is `{ id: 'a', compass: 'n' }`, as `a:n` is in DOT and to Graphviz. In 3.x it was a port named `n`, which `toDot` wrote as `a:"n"` and every DOT reader, Graphviz included, again took as the compass point. Use an object target (`{ id: 'a', port: 'n' }`) for a port that really is named like a compass point; it is still written as a port, which Graphviz will read as a compass point.

Writing (`toDot` / `fromModel`):

- A port containing `:` throws a `TypeError` with code `TSG_ERR_INVALID_PORT`. Graphviz always splits a port on `:` into port and compass point, even inside quotes (`b:"p:q"` is port `p`, compass `q`), so such a port cannot be written as given.
- An edge target's compass point is written only when it is one of the ten; any other value throws a `TypeError` with code `TSG_ERR_INVALID_EDGE_TARGETS`. In 3.x, the compass point of a target given as an object (`{ id: 'a', compass: … }`) was written as a quoted string without a check. An empty compass point is left out.
