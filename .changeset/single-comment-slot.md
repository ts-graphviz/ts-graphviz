---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
"@ts-graphviz/ast": major
---

Remove the duplicate `comment` slot on node and edge attribute groups

`node.attributes.comment` / `edge.attributes.comment` (a comment written inside the `[...]` attribute list) is removed. It duplicated `node.comment` / `edge.comment`, was not read back by `fromDot`, and `AttributesGroupModel` no longer extends `HasComment`. Use `model.comment`, which is written before the statement.

The Graphviz `comment` *attribute* is unaffected: set it with `attributes.set('comment', ...)` (or `{ comment: ... }` in the attributes object of the factory API).
