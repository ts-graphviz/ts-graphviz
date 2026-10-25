---
"@ts-graphviz/common": minor
"@ts-graphviz/react": minor
---

New `AnyDotObjectModel`: the union of the concrete models (`GraphStatementModel | RootGraphModel | DotModel`), discriminated by `$$type`, so `if` / `switch` on `$$type` narrows it. `@ts-graphviz/react`'s `getTopLevelModels()` and `onRenderComplete` give `AnyDotObjectModel[]` instead of `DotObjectModel[]`.
