---
"@ts-graphviz/ast": patch
---

`toDot` / `fromModel` write an edge target's compass point only when it is one of DOT's (`n`, `ne`, `e`, `se`, `s`, `sw`, `w`, `nw`, `c`, `_`) and throw a `TypeError` with code `TSG_ERR_INVALID_EDGE_TARGETS` otherwise. Before, the compass point of a target given as an object (`{ id: 'a', compass: … }`) was written between quotes without any check, so its text could end the string. An empty compass point is still left out.
