---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
"@ts-graphviz/ast": minor
"ts-graphviz": major
"@ts-graphviz/react": minor
---

The factories give the graph's DOT DSL; the models only hold the data

`digraph()`, `graph()`, `strict.*` and `withContext().*` give the graph's **DOT DSL** (`DSL<G>`) instead of the model, and so do their callbacks. The DSL reads like DOT:

- the DOT statements `node`, `edge`, `subgraph` and `graph` are its methods, with the same overloads as before (`g.node(id, attributes?, callback?)`, `g.node(attributes)` for `node [...]`, and so on);
- attributes are properties under their own names: `g.rankdir = 'LR'`, `a.label`, `delete a.label` (assigning `undefined` deletes too), `g.$attributes.node.shape = 'box'`;
- the model's own members take a `$`: `a.$id` (the node's name; `a.id` is the Graphviz `id` attribute), `a.$comment`, `g.$nodes`, `g.$getNode('a')`, `g.$createNode('a')`, `a.$port('p')`, and the members of your own classes (`g.$myMethod()`); members whose names start with `$$` keep them (`a.$$type`), and any other member takes one more `$` (a member `$foo` is `$$foo`).

Every model you get from a DSL is a DSL, and a model has one DSL, so DSLs compare with `===`. `modelOf(dsl)` gives the model and `dsl(model)` the DSL of a model, such as one `fromDot` returns. The DSL works through the graph's `createNode`, `createEdge`, `getNode`, `getSubgraph`, `createSubgraph` and `addAttributeList`, so it follows the classes of the models context and the methods a custom class overrides: with `orderedModels`, `g.node({ ... })` after other statements stays in its place, as `node [...]` does in DOT.

Compared with 3.x:

- `GraphBaseModel` and the core classes no longer have `node()`, `edge()`, `subgraph()` and `graph()`; use the DSL (`dsl(model).node('a')`) or the model's `createNode` and the other basic operations. A custom class that overrode them should override `createNode` / `createEdge` / `createSubgraph`.
- On what the factories give, `id`, `comment` and `size` are now Graphviz attributes; the model's members are `$id`, `$comment` and `$size`. `set`, `get`, `attributes`, `port`, `nodes` and the other members take a `$`.
- `@ts-graphviz/common` exports `MODEL` (`Symbol.for('@ts-graphviz/common/model')`), the key under which a DSL gives its model, the `ModelView` type for such objects, and `modelOf()`. `toDot`, `fromModel` / `FromModelConverter`, the adapter's `toBlob`, and `createRoot({ container })` / `renderToDot({ container })` of `@ts-graphviz/react` take a DSL in place of its model. A DSL is not a model, so the model guards (`isNodeModel` and the others, `isForwardRefNode`, `isNodeRef`) are false for it: narrow DSLs by `$$type`, or check `modelOf(x)`.
- The core models take the model a DSL stands for where they take a model (`addNode`, `addEdge`, `addSubgraph`, `remove*`, `exist*`, `Dot`'s graphs, an `Edge`'s targets), so a model only ever holds models.
- New error codes: `TSG_ERR_NOT_A_MODEL` (`dsl()` given something else) and `TSG_ERR_UNWRITABLE_PROPERTY` (assigning a DOT statement, a symbol, or an attribute of a `Dot` model's DSL).

See the v3 to v4 migration guide for a table of the changes and how to find the code that uses `id`, `comment` and `size`.
