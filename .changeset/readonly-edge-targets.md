---
"@ts-graphviz/common": minor
"@ts-graphviz/core": minor
"@ts-graphviz/react": minor
---

Edge targets can be given as readonly tuples and arrays (e.g. `as const`): `edge`, `createEdge`, `toNodeRefGroup` and `<Edge targets>` take the new `ReadonlyEdgeTargetLikeTuple` / `ReadonlyNodeRefGroupLike`, which every existing `EdgeTargetLikeTuple` / `NodeRefGroupLike` value satisfies. `isNodeRefGroupLike` narrows to the group type it was given, so a mutable group stays mutable.
