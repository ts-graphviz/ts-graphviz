---
"@ts-graphviz/react": minor
---

Rendered trees use custom model classes, and root graphs accept `strict`

- `createRoot` / `renderToDot` take a new `models` option (a partial `ModelsContext`): the root graphs are created with its `Digraph` / `Graph` classes, and subgraphs, nodes and edges through the graph they belong to, so custom model classes are used throughout a rendered tree.
- `RootGraphOptions` / `RootGraphProps` have `strict`, so `<Digraph strict>` renders `strict digraph`.
