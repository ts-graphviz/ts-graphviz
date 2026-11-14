---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
"@ts-graphviz/ast": minor
"ts-graphviz": major
"@ts-graphviz/react": minor
---

The factories give the graph's DOT DSL; the models only hold the data

`digraph()`, `graph()`, `strict.*` and `withModelKit().*` give the graph's **DOT DSL** (`DSL<G>`) instead of the model, and so do their callbacks. The DSL has DOT's words only:

- the DOT statements `node`, `edge`, `subgraph` and `graph` are its methods, with the same overloads as before (`g.node(id, attributes?, callback?)`, `g.node(attributes)` for `node [...]`, and so on);
- attributes are properties under their own names: `g.rankdir = 'LR'`, `a.label`, `delete a.label` (assigning `undefined` deletes too), `a.id` and `a.comment` (the Graphviz attributes);
- besides those, a DSL has only `addComment`, `$$type` (and an attribute list's `$$kind`), and a node's `port` (`g.edge([a.port('p'), b])`).

Everything else the model does is on the model, which `modelOf(x)` gives: `modelOf(a).id` (the node's name), `modelOf(g).nodes`, `getNode`, `createNode`, `getAttribute`, `comments`, `directed`, and the members of your own classes. A name that is not a statement or one of those few members is an attribute; none of those names is a Graphviz attribute. An attribute of your own schema named like one (`port`, say) is read and written on the model: `modelOf(a).getAttribute('port')`.

Every model you get from a DSL is a DSL, and a model has one DSL, so DSLs compare with `===`. `modelOf(dsl)` gives the model and `dsl(model)` the DSL of a model, such as one `fromDot` returns. The DSL works through the graph's `createNode`, `createEdge`, `getNode`, `getSubgraph`, `createSubgraph` and `addAttributeList`, so it follows the classes of the model kit and the methods a custom class overrides: `g.node({ ... })` after other statements stays in its place, as `node [...]` does in DOT, and returns the list's DSL.

`fromDot` and `fromDotAll` take `dsl: true` to return the DSL of what they read; the default stays the model.

```ts
const G = fromDot('digraph { a }', { dsl: true });
G.node('a').label = 'A';

const [A, B] = fromDotAll(src, { dsl: true });
```

The result is typed by the option and the classes given (`convert.models`): `DSL<MyNode>` for `{ dsl: true, parse: { as: 'Node' }, convert: { models: { Node: MyNode } } }`. `FromDotOptions` takes the type of `dsl` as its third type parameter (`false` by default; with `true`, `dsl: true` is required) and is now a type alias rather than an interface, and `FromDotResult<T, D>` gives what a reader returns for a model `T`. `ts-graphviz/legacy` takes the option too.

Compared with 3.x:

- `GraphBaseModel` and the core classes no longer have `node()`, `edge()`, `subgraph()` and `graph()`; use the DSL (`dsl(model).node('a')`) or the model's `createNode` and the other basic operations. A custom class that overrode them should override `createNode` / `createEdge` / `createSubgraph`.
- On what the factories give, `id`, `comment` and `size` are now Graphviz attributes; the model's members are read on `modelOf(x)`. So are `set`, `get`, `attributes`, `nodes` and the other members, except `port` and `addComment`.
- `@ts-graphviz/common` exports `MODEL` (`Symbol.for('@ts-graphviz/common/model')`), the key under which a DSL gives its model, the `ModelView` type for such objects, and `modelOf()`. `toDot`, `fromModel` / `FromModelConverter`, the adapter's `toBlob`, and `createRoot({ container })` / `renderToDot({ container })` of `@ts-graphviz/react` take a DSL in place of its model. A DSL is not a model, so the model guards (`isNodeModel` and the others, `isForwardRefNode`, `isNodeRef`) are false for it: narrow DSLs by `$$type`, or check `modelOf(x)`.
- The core models take the model a DSL stands for where they take a model (`addNode`, `addEdge`, `addSubgraph`, `remove*`, `exist*`, `Dot`'s graphs, an `Edge`'s targets), so a model only ever holds models.
- New error codes: `TSG_ERR_NOT_A_MODEL` (`dsl()` given something else) and `TSG_ERR_UNWRITABLE_PROPERTY` (assigning a DOT statement, a symbol, or an attribute of a `Dot` model's DSL).

See the v3 to v4 migration guide for a table of the changes and how to find the code that uses `id`, `comment` and `size`.
