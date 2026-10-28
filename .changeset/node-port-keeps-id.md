---
"@ts-graphviz/core": patch
---

Fix: `Node.port()` no longer lets an `id` key in the port object replace the node's id. The edge target always points at the node `port()` was called on.
