---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
---

Subgraph attributes are typed by the subgraph's id. Graphviz draws a subgraph as a cluster only when its id starts with `cluster` (or it has `cluster=true`), and silently ignores attributes that don't apply, so `subgraph(…)` and `createSubgraph(…)` now pick the attribute object from the id (`SubgraphAttributesFor<Id>`, new):

- an id starting with `cluster` takes cluster attributes (`ClusterSubgraphAttributesObject`, new): `pencolor`, `bgcolor`, `label`, …;
- any other id, or no id, takes subgraph attributes (`rank`), or cluster attributes together with `cluster: true` (`NonClusterSubgraphAttributesObject`, new);
- an id known only at run time (`string`) takes either, as before.

**Breaking (types only):** code that sets cluster attributes on a subgraph whose literal id does not start with `cluster` (and has no `cluster: true`), or `rank` on a cluster, no longer type-checks. Graphviz ignored those attributes; rename the subgraph to `cluster_…`, add `cluster: true`, or drop the attribute.
