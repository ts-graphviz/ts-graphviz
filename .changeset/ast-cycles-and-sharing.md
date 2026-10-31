---
"@ts-graphviz/ast": minor
"@ts-graphviz/common": minor
---

`stringify`, `toModel` and `fromModel` (and so `toDot`) reject a structure that contains itself and limit how far shared nodes multiply the work. An AST or model built in code (or by `structuredClone` or a custom deserialiser) can contain itself, such as a subgraph among its own statements (`s.addSubgraph(s)`); these functions throw a `TypeError` with code `TSG_ERR_CYCLIC_STRUCTURE` for it (3.x printed it until memory ran out, or ran out of call stack). Such an AST can also hold one node object in several places, each printed or converted again, so a node held twice at each of k levels is written 2^k times. The new `maxSharedNodes` option of `stringify` / `Printer` and of `toModel` (default 100 000, `0` disables) counts every time a node object is reached after the first; past it, they throw a `RangeError` with code `TSG_ERR_SHARED_NODE_COUNT_EXCEEDED`. An AST without shared nodes, such as a parsed one, is never counted; `fromModel` counts every AST node it makes toward `maxASTNodes`. `toModel` collects the nodes of each subgraph once, in time linear in the nesting depth.

The error for an AST node or model that no plugin handles (`TSG_ERR_NO_PLUGIN`) names only its type, also for a node that cannot be serialised or a type that is not a string. The errors for an attribute list kind, a port and a compass point quote at most the first 64 characters of the value.
