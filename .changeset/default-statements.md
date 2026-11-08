---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
"@ts-graphviz/ast": minor
"@ts-graphviz/react": minor
"ts-graphviz": major
---

Default attribute statements keep their place, as in DOT

In DOT, a default attribute statement (`node [...]`, `edge [...]`) applies only to what follows it; `graph [...]` sets the graph's own attributes wherever it is written, and the defaults of the subgraphs that follow it. 3.x merged every one into one set of defaults per graph (`attributes.node` and so on), written first, so a default given after other statements applied to what came before it too. In v4 the model classes keep each where it was written: `node [color=red]; a; node [color=blue]; b` read with `fromDot` renders `a` red and `b` blue, as Graphviz does, and

```ts
digraph((g) => {
  g.node('a');
  g.node({ shape: 'box' }); // 3.x: a is a box too; v4: only what follows
  g.node('b');
});
```

What changes for 3.x code: a default given after other statements (`g.node({ ... })`, `g.edge({ ... })`, `g.graph({ ... })`, `addAttributeList`), and DOT with several statements of one kind. A program that gives every default before its other statements (or with `attributes.node.set(...)`) and none after them renders as before; where a default is also given after other statements, it overrides the leading one for what follows it.

- `GraphBaseModel.addAttributeList(kind, attributes)` adds a default attribute statement and returns its list (typed by kind and schema); the DSL's `g.node({ ... })`, `g.edge({ ... })` and `g.graph({ ... })` return its DSL. Keep it to change those defaults later. A statement added before any other joins the leading defaults; one added after takes its place in `statements`. `addAttributeList` (and `stringify`) accept only the kinds `Graph`, `Node` and `Edge`, since the kind is written as a keyword; anything else throws a `TypeError` with code `TSG_ERR_INVALID_ATTRIBUTE_LIST_KIND`. A class that overrides `addAttributeList` declares the overload of each kind with its return type.
- The 3.x classes are kept, deprecated and removed in v5, as `legacyModels` (`LegacyGraph`, `LegacyDigraph`, `LegacySubgraph`), with the entry `ts-graphviz/legacy` (the same API with them): import from there, or pass `legacyModels` (`withContext(legacyModels)`, `fromDot(source, { convert: { models: legacyModels } })`), to keep the 3.x output.
- `GraphBaseModel.attributes` (and the DSL's `$attributes`) is deprecated, removed in v5: it is the leading defaults only. Write a default attribute statement instead. Deprecations are marked in the types only; nothing is reported at run time.
- `@ts-graphviz/react` keeps a graph element's `node`, `edge` and `graph` props in default attribute lists it adds when the graph is created, so they lead the graph as before, whatever the models context.
