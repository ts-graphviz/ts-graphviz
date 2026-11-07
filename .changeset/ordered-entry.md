---
"ts-graphviz": minor
---

`ts-graphviz/ordered`: the same API, with default attribute statements kept in their place

`ts-graphviz/ordered` exports everything `ts-graphviz` does, with the models of `orderedModels`: a `node [...]`, `edge [...]` or `graph [...]` statement written after other statements applies, as in DOT, only to what follows it. Switching is one import:

```ts
import { digraph, fromDot, toDot } from 'ts-graphviz/ordered';

const G = digraph('G', (g) => {
  g.node({ color: 'red' });
  g.node('a'); // red
  g.node({ color: 'blue' });
  g.node('b'); // blue
});

toDot(fromDot('digraph { node [color=red]; a; node [color=blue]; b; }'));
// keeps both node statements in their place
```

`digraph`, `graph` and `strict` create the ordered classes; `withContext(models)` uses the classes you give and the ordered ones for the rest; `fromDot` and `fromDotAll` use the ordered classes for the kinds `convert.models` leaves out. Everything else is the same as in `ts-graphviz`. `ts-graphviz` itself keeps one set of defaults per graph.
