---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
"@ts-graphviz/ast": major
"@ts-graphviz/react": minor
"ts-graphviz": major
---

Graph attribute assignments keep their place

In a graph's body, `bgcolor=gray;` is to Graphviz the same as `graph [bgcolor=gray]` where it is written: a later one overrides it, and it is the default of the subgraphs that follow it only. 3.x made every assignment one of the graph's own attributes, written before every statement, so `digraph { a; graph [bgcolor=red]; bgcolor=gray; b }` read with `fromDot` and written with `toDot` rendered red where the source renders gray.

A new model keeps an assignment where it is: `AttributeAssignmentModel` (`$$type: 'AttributeAssignment'`, `key`, `value`, leading and trailing comments), the class `AttributeAssignment`, the read-only `ReadonlyAttributeAssignmentModel` and the guard `isAttributeAssignmentModel`. It is one of a graph's `statements`.

- `addAttributeAssignment(key, value)` adds one as the graph's last statement and returns it, typed by the graph's attribute keys and schema; setting its `value` changes it in place. `removeAttributeAssignment(assignment)` takes it out. A key that is not a string or a `null` / `undefined` value throws a `TypeError` with code `TSG_ERR_INVALID_ATTRIBUTE_ASSIGNMENT`.
- The DOT DSL's `g.assign(key, value)` adds one where it is called and returns its DSL (`$$type`, `key`, `value`, `addComment`). `g.bgcolor = ...` still sets the graph's own attribute.
- `toModel` (and `fromDot`) makes an assignment written before every other statement (default attribute statements included) one of the graph's own attributes, as before, so `getAttribute` reads it and a graph's attributes read back as they were written; a later one becomes an `AttributeAssignmentModel` in its place, with the comments around it. `fromModel` writes it as `key = value;` in its place.
- `@ts-graphviz/ast/legacy`'s `toModel`, and so `fromDot` of `ts-graphviz/legacy`, make every assignment an own attribute, as 3.x did.
- `DotObjectType`, `GraphStatementModel`, `ReadonlyGraphStatementModel`, `FilterableModel` and `ModelToAST` include the new model; code that switches on a statement's `$$type` meets `'AttributeAssignment'`. `GraphBaseModel` has the two methods, so a class that implements the interface itself needs them too. `@ts-graphviz/react` re-exports the guard.
