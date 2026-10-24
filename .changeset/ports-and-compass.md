---
"@ts-graphviz/common": major
"@ts-graphviz/ast": major
"ts-graphviz": major
---

Reject ports containing `:` and accept any compass point Graphviz writes

- Graphviz always splits a port on `:` into port and compass point, even inside quotes (`b:"p:q"` is port `p`, compass `q`). `toDot` now rejects such a port with a `TypeError` (`code: 'TSG_ERR_INVALID_PORT'`, added to `ERROR_CODES`) instead of writing DOT that Graphviz reads differently.
- After a port, the parser accepts any ID as the compass point, as Graphviz does; `dot -Tcanon` output such as `b:"":""` now parses. A compass point that is not one of `n ne e se s sw w nw c _` is ignored when converting to a model, as Graphviz ignores it. `a:p:nx` is therefore port `p` with an ignored compass point, not a syntax error.
