---
"@ts-graphviz/adapter": patch
"@ts-graphviz/react": patch
---

The remaining options and props that were destructured directly are read through `ownOptions`: the adapter's argument builder and source check, and react's `useDigraph`, `useGraph`, `useNode`, `useEdge`, `useSubgraph` and `createRoot` internals. A lint rule now reports any new place that destructures an options object without it.
