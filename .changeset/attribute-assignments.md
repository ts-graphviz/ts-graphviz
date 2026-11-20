---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
"@ts-graphviz/ast": major
"@ts-graphviz/react": minor
"ts-graphviz": major
---

Graph attribute assignments are statements where they are written

In a graph's body, `bgcolor=gray;` is to Graphviz the same as `graph [bgcolor=gray]` where it is written: a later one overrides it, and it is the default only of the subgraphs that follow it. 3.x made every assignment one of the graph's own attributes, written before every statement, so `digraph { a; graph [bgcolor=red]; bgcolor=gray; b }` read with `fromDot` and written with `toDot` rendered red where the source renders gray.

A new model keeps an assignment where it is: `AttributeAssignmentModel` (`$$type: 'AttributeAssignment'`, `key`, `value`, leading and trailing comments), the class `AttributeAssignment`, the read-only `ReadonlyAttributeAssignmentModel` and the guard `isAttributeAssignmentModel`. It is one of a graph's `statements`.

- `addAttributeAssignment(key, value)` adds one as the graph's last statement and returns it, typed by the graph's attribute keys and schema; setting its `value` changes it in place. `removeAttributeAssignment(assignment)` takes it out. A key that is not a string or a `null` / `undefined` value throws a `TypeError` with code `TSG_ERR_INVALID_ATTRIBUTE_ASSIGNMENT`.
- **The DOT DSL of a graph or subgraph writes its attribute names as assignments**: `g.rankdir = 'LR'` adds `rankdir = "LR";` where it runs, each time it runs. Reading `g.rankdir` or `delete g.rankdir` throws a `TypeError` with the new code `TSG_ERR_WRITE_ONLY_PROPERTY`; assigning `undefined` throws `TSG_ERR_INVALID_ATTRIBUTE_ASSIGNMENT`. Names JavaScript and tools look up on any object (`then`, `toJSON`, those of `Object.prototype`) read as `undefined`. The graph's own attributes are the factory's attributes argument (`digraph('G', { rankdir: 'LR' })`) or the model's (`modelOf(g).setAttribute`, `getAttribute`). Node, edge and attribute list DSLs keep their attribute properties. The types still let a graph DSL's attribute be read (TypeScript has no write-only mapped properties).
- **`toModel` (and `fromDot`) makes every assignment of a body an `AttributeAssignmentModel` in its place**, the first ones included, with the comments around it: `fromDot('digraph { rankdir=LR; a }').getAttribute('rankdir')` is `undefined`; read the assignments in `statements`. The graph's own attributes, which `fromModel` writes first, read back as assignments. `fromModel` writes an assignment as `key = value;` in its place.
- `ts-graphviz/legacy` keeps 3.x: its DSL's names are the graph's own attributes, and its `fromDot` (`@ts-graphviz/ast/legacy`'s `toModel`) makes every assignment an own attribute.
- `DotObjectType`, `GraphStatementModel`, `ReadonlyGraphStatementModel`, `FilterableModel` and `ModelToAST` include the new model; code that switches on a statement's `$$type` meets `'AttributeAssignment'`. `GraphBaseModel` has the two methods, so a class that implements the interface itself needs them too. `@ts-graphviz/react` re-exports the guard.
