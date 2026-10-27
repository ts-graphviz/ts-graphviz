---
"@ts-graphviz/react": major
---

`<Subgraph>`'s props are typed by its `id`, as `subgraph()` is (`SubgraphAttributesFor`): `<Subgraph id="cluster_a" label="A">` and `<Subgraph id="row" rank="same">` type-check, and `<Subgraph id="row" label="x">` does not (Graphviz ignores a label there). Add `cluster` to make any subgraph a cluster. An `id` not known until run time takes either kind, as before.

**Breaking (types only):**

- `SubgraphOptions` and `SubgraphProps` are generic type aliases, no longer interfaces, so they cannot be augmented by declaration merging.
- `Subgraph` is typed as a generic function component instead of `FC<SubgraphProps>`.
