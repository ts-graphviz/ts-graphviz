---
"@ts-graphviz/core": major
"ts-graphviz": major
---

`DotObject` is removed

`DotObject`, the empty base class of the core models (`Node`, `Edge`, `Dot`, and through `AttributesBase` the graphs and attribute lists), is removed: it had no members, and nothing in the library relied on it. Code that checked `instanceof DotObject` checks the kind of model instead: the model guards (`isNodeModel`, `isEdgeModel`, `isRootGraphModel`, …) or `$$type` accept any model of that kind (they look at `$$type` and a few fields, not at every member); `instanceof Node` and the other core classes where an instance of a core class is needed. A class of your own that extended `DotObject` without being a model (no `$$type`) is recognised by neither: check it with `instanceof` your class. Such a class extends nothing now, or the core class it stands for.
