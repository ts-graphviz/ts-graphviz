---
"@ts-graphviz/common": major
---

Generate attribute types from the Graphviz documentation

The attribute keys, their TSDoc and their value types in `@ts-graphviz/common` are now generated from the official Graphviz documentation (graphviz.org, pinned to a commit of the website repository) instead of being maintained by hand. The augmentation points (`EdgeAttributeKey.$values`, `Attribute.$keys`, `Attribute.$types`, …) are unchanged.

Changes visible to users:

- Added attributes: `radius` (edge); `beautify`, `linelength`, `oneblock`, `tooltip` (graph); `bb`, `cluster` (cluster); `cluster` (subgraph).
- Removed `mosek` (graph), which Graphviz no longer documents.
- `tailclip` is now `boolean` (it was mistakenly typed as `Point`); `tail_lp` is now `Point` (it was `string`).
- `TBbalance` now has documentation like every other attribute.
