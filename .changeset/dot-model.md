---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
"@ts-graphviz/ast": major
"ts-graphviz": major
---

Add a `Dot` model and make `fromModel` / `toModel` symmetric with the AST

A DOT source (comments and one or more root graphs) now has a model: `DotModel` in `@ts-graphviz/common` and the `Dot` class in `@ts-graphviz/core` (`graphs`, `addGraph`, `removeGraph`, `comment`). `ModelsContext` gained a `Dot` constructor and `isDotModel` is exported.

Conversions map 1:1 to AST node types:

- `fromModel(dotModel)` returns a `Dot` AST node; `fromModel(rootGraph)` now returns a `Graph` AST node (previously a `Dot` wrapping the graph). A root graph's `comment` is written by the `Dot` conversion, right before the graph statement.
- `toModel(dotAst)` now returns a `DotModel` holding every graph (previously the first graph only; further graphs and trailing comments were dropped). Comments right before a graph are attached to that graph; other comments go to `DotModel.comment`.
- The parser accepts any number of root graphs in one source, as Graphviz does, including none.
- `toDot(rootGraph)` is unchanged in output (it wraps the graph in a `Dot`), and also accepts a `DotModel`.
- `fromDot(source)` still returns the first root graph, and throws a descriptive error when the source has no graph. Use `toModel(parse(source))` to get the whole `DotModel`.
