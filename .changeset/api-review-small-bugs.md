---
"@ts-graphviz/adapter": patch
"@ts-graphviz/core": patch
---

Small fixes from the API review

- adapter: `-G`/`-N`/`-E` attribute values are passed verbatim. They reach Graphviz as argv (no shell), so the quotes that were added around values with whitespace ended up inside the value (`label="a b"` with literal quotes); quotes and backslashes in values now arrive unchanged (#1592).
- adapter: fdp `grid` and `oldAttractive` follow the Graphviz defaults (grid on, old attractive force off); `-Lg` / `-LO` are emitted only when an option differs from the default, and a bare `-L` is no longer emitted (#1591). The documented default of `oldAttractive` is corrected to `false`.
- core: `subgraph('')` looks up or creates the subgraph with the empty id instead of a new anonymous one, and `edge(targets, null)` ignores the `null` (#1593).
