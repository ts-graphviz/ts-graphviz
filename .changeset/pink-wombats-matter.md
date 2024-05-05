---
"@ts-graphviz/core": major
---

Drop DotObject class

`DotObject` was provided as a base class for Models including `Digraph` and `Node` implemented in ts-graphviz.

However, in order to allow users' customized behavior, TypeScript's interface feature is used to provide Custom Class functionality, and inheritance of the class is not required.

Although implemented from the beginning for extensibility, it is still not implemented with any methods or properties, and there are no future use cases, so it will be removed.
