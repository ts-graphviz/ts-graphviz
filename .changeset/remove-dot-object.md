---
"@ts-graphviz/core": major
"ts-graphviz": major
---

`DotObject` is removed

`DotObject`, the empty base class of the core models (`Node`, `Edge`, `Dot`, and through `AttributesBase` the graphs and attribute lists), is removed: it had no members, and nothing in the library relied on it. Code that checks `instanceof DotObject` uses the model guards (`isNodeModel`, `isEdgeModel`, `isRootGraphModel`, …) or `$$type` instead; a class that extended it extends nothing, or the core class it stands for.
