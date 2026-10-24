---
"@ts-graphviz/common": major
"ts-graphviz": major
---

String edge targets read compass points like DOT

- `isCompass()` now accepts `_` ("any side"), so `'a:p:_'` keeps its compass point (it was dropped) (#1688).
- A lone compass point after the id is the compass point: `'a:n'` is `{ id: 'a', compass: 'n' }`, as `a:n` is in DOT and to Graphviz. It used to be a port named `n`, which `toDot` wrote as `a:"n"` and every DOT reader, Graphviz included, again took as the compass point. Use an object target (`{ id: 'a', port: 'n' }`) for a port that really is named like a compass point; it is still written as a port, which Graphviz will read as a compass point.
