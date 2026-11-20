---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
"@ts-graphviz/ast": major
"ts-graphviz": major
---

(Experiment) A graph's attributes are its graph attribute assignments

A graph or subgraph has no table of attributes apart: its attributes are the `AttributeAssignmentModel`s among its `statements`, so the DSL, the model and DOT hold them in the same shape. `getAttribute(key)` is the value of the last assignment of `key` (the value Graphviz gives the graph); `setAttribute(key, value)` sets the first assignment of `key` and removes the others, or adds one at the start of the body after the assignments there; `removeAttribute(key)` removes every assignment of `key`; `getAttributeNames()` lists the keys assigned, in the order they first are. The constructor's and the factories' attributes are the first assignments, in their order. `GraphBaseModel.attributesInStatements` (`true`; `false` for the deprecated classes of `legacyModels`, which keep a table as in 3.x) tells `fromModel` not to write attributes apart. A default attribute statement added after the constructor's attributes is a statement in its place, not one of the leading lists.
