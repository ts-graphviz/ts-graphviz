---
"@ts-graphviz/react": minor
---

Rendered trees use custom model classes, and root graphs accept `strict`

- `createRoot` / `fromElement` take a new `models` option (some of the classes of a `ModelKit`): every model of a rendered tree (root graphs, subgraphs, nodes and edges) is created with the kit of those classes.
- `RootGraphOptions` / `RootGraphProps` have `strict`, so `<Digraph strict>` renders `strict digraph`.
