---
"ts-graphviz": minor
---

`ts-graphviz/legacy`: the same API with the 3.x default attribute statements (deprecated)

`ts-graphviz/legacy` exports everything `ts-graphviz` does, with the classes of `legacyModels`: every `node [...]`, `edge [...]` and `graph [...]` statement is merged into the graph's one set of defaults, written first, as 3.x did. Importing from it keeps the 3.x output while you move to v4's statement order:

```ts
import { digraph } from 'ts-graphviz/legacy';

digraph('G', (g) => {
  g.node('a');
  g.node({ color: 'blue' }); // a is blue too, as in 3.x
});
```

`digraph`, `graph` and `strict` create the legacy classes; `withContext(models)` uses the classes you give and the legacy ones for the rest; `fromDot` and `fromDotAll` use the legacy classes for the kinds `convert.models` leaves out. Everything else is the same as in `ts-graphviz`, and `pnpm api:check` keeps the two APIs the same. The entry is deprecated and removed in v5.
