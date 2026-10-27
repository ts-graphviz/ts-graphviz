---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
"@ts-graphviz/ast": major
"ts-graphviz": major
---

Add a `Dot` model for whole DOT sources, `fromDotAll`, and make `fromModel` / `toModel` symmetric with the AST

A DOT source (comments and any number of root graphs) has a model: `DotModel` in `@ts-graphviz/common` and the `Dot` class in `@ts-graphviz/core` (`graphs`, `addGraph`, `removeGraph`, `comment`). `ModelsContext` has a `Dot` constructor and `isDotModel` is exported.

- The parser accepts any number of root graphs in one source, as Graphviz does, including none. In 3.x a source had to hold exactly one graph.
- New `fromDotAll(dot, options?)` returns the models of every graph, in order (an empty array for a source without graphs).
- `fromDot(dot)` returns the source's one root graph. A source with more than one graph throws an `Error` with code `TSG_ERR_MULTIPLE_GRAPHS`, and a source without a graph an `Error` with code `TSG_ERR_NO_GRAPH`.

Conversions map 1:1 to AST node types:

- `fromModel(dotModel)` returns a `Dot` AST node; `fromModel(rootGraph)` returns a `Graph` AST node (in 3.x, a `Dot` wrapping the graph). A root graph's `comment` is written by the `Dot` conversion, right before the graph statement.
- `toModel(dotAst)` returns a `DotModel` holding every graph (in 3.x, the root graph model). Comments right before a graph are attached to that graph; other comments go to `DotModel.comment`. Use `toModel(parse(source), { models })` to get the whole `DotModel`.
- `toDot(rootGraph)` is unchanged in output (it wraps the graph in a `Dot`), and also accepts a `DotModel`.
