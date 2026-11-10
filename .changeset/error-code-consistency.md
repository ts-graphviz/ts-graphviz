---
"@ts-graphviz/adapter": patch
"@ts-graphviz/common": minor
"@ts-graphviz/react": minor
"ts-graphviz": patch
---

Give the remaining adapter and React errors a consistent `code`

- A `maxOutputSize` that is negative or not finite is rejected with `TSG_ERR_INVALID_OPTION`, like every other data option. `TSG_ERR_OUTPUT_LIMIT_EXCEEDED` now only means that the command wrote more than the limit.
- `@ts-graphviz/react` errors carry a `code`:

  | Situation | Class | `code` |
  | --- | --- | --- |
  | no top-level graph was rendered (without a `container`) | `Error` | `TSG_ERR_NO_GRAPH` |
  | more than one top-level graph was rendered | `Error` | `TSG_ERR_MULTIPLE_GRAPHS` |
  | `useCurrentGraph()`, `<Node>` or `<Edge>` outside a `Digraph`, `Graph` or `Subgraph` | `Error` | `TSG_ERR_NO_CURRENT_GRAPH` (new) |
  | `root.render()` after `unmount()`, or an unmount before the render settled | `Error` | `TSG_ERR_ROOT_UNMOUNTED` (new) |
  | `<Edge>` with fewer than two targets | `TypeError` (was `Error`) | `TSG_ERR_INVALID_EDGE_TARGETS` |
