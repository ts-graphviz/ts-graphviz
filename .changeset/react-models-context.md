---
"@ts-graphviz/react": major
---

Root graph hooks honour the models context and accept `strict`

- `useDigraph` / `useGraph` now create the root graph with the `Digraph` / `Graph` class of the `GraphvizContext` instead of the built-in classes, and `useSubgraph` creates subgraphs through the enclosing graph (`createSubgraph`), so custom model classes are used throughout a rendered tree.
- `createRoot` / `renderToDot` take a new `models` option (a partial `ModelsContext`) to supply those classes.
- `RootGraphOptions` / `RootGraphProps` gain `strict`, so `<Digraph strict>` renders `strict digraph`.
- `GraphvizContext` values now require a `models` field; code that provided the context by hand must pass `createModelsContext(...)`.
