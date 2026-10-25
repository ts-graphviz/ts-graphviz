---
"@ts-graphviz/common": minor
"@ts-graphviz/core": minor
"@ts-graphviz/react": minor
---

Edge targets can be given as readonly tuples and arrays (e.g. `as const`): `edge`, `createEdge`, `toNodeRefGroup`, `<Edge targets>` and the `Edge` constructor (`ReadonlyEdgeTargetTuple`, which copies them) take the new `ReadonlyEdgeTargetLikeTuple` / `ReadonlyNodeRefGroupLike`, which every existing `EdgeTargetLikeTuple` / `NodeRefGroupLike` value satisfies. `isNodeRefGroupLike` narrows a mutable (or untyped) value to `NodeRefGroupLike` as before, and a readonly one to `ReadonlyNodeRefGroupLike`.
