---
description: |-
  Upgrade your ts-graphviz project from v3 to v4. Learn how attribute values became explicit (literal text, escString, htmlLike), how errors are reported with stable codes, how the models context and the Dot model changed, and what changed in the AST, adapter and React packages.
---
# Migration from v3 to v4

v4 is the release where the API review of the 3.x line landed: attribute values became explicit about what they mean, errors became identifiable, the model classes stopped depending on import order, and the AST was tidied. Programs that build a graph with the factory API keep their `node`, `edge` and `subgraph` calls, but the factories now give the graph's DOT DSL, which reads attributes and model members differently: start with section 1. This guide lists every change that can affect existing code, by area, with what to do about it.

Requirements: **Node.js 22 or later** (Node.js 20 reached end of life) and, for TypeScript users, **TypeScript 5.0 or later** (see *Supported TypeScript versions* in the Versioning Policy).

## 1. The factories give the DOT DSL

`digraph()`, `graph()`, `strict.*` and `withContext().*` give the graph's **DOT DSL** instead of the model, and so do the callbacks and everything you reach from a DSL. The DSL reads like DOT: the statements `node`, `edge`, `subgraph` and `graph` are methods, **attributes are properties under their own names**, and **the model's own members take a `$`**. The models only hold the data (`node()`, `edge()`, `subgraph()` and `graph()` are no longer model methods).

**Names whose meaning changed.** On a DSL, `id`, `comment` and `size` are the Graphviz attributes of those names, not the model's members:

| 3.x (on what the factories give) | v4 |
| --- | --- |
| `node.id` (the node's name) | `node.$id` (`node.id` is the Graphviz `id` attribute) |
| `g.id` | `g.$id` |
| `x.comment = '...'` (a DOT comment) | `x.$comment = '...'` (`x.comment` is the Graphviz `comment` attribute) |
| `g.size` (the number of attributes) | `g.$size` (`g.size` is the Graphviz `size` attribute) |

TypeScript reports most other changes, but these three still compile, so search for them: `\.id\b`, `\.comment\b` and `\.size\b`.

**Other changes:**

| 3.x | v4 |
| --- | --- |
| `g.set('rankdir', 'LR')`, `g.get('rankdir')` | `g.rankdir = 'LR'`, `g.rankdir` (or `g.$set(...)`, `g.$get(...)`) |
| `node.attributes.set('label', 'A')` | `node.label = 'A'` (or `node.$attributes.set(...)`) |
| `node.attributes.delete('label')` | `delete node.label` or `node.label = undefined` |
| `g.attributes.node.set('shape', 'box')` | `g.$attributes.node.shape = 'box'` or `g.node({ shape: 'box' })` |
| `node.port('p')` | `node.$port('p')` |
| `g.nodes`, `g.getNode('a')`, `g.createNode('a')`, `g.addNode(n)` | `g.$nodes`, `g.$getNode('a')`, `g.$createNode('a')`, `g.$addNode(n)`: models are given as DSLs |
| your class's own methods, `g.myMethod()` | `g.$myMethod()` |
| `new Digraph().node('a')`, `fromDot(src).node('a')` | `dsl(new Digraph()).node('a')`, `dsl(fromDot(src)).node('a')` |
| a custom class overriding `node()` / `edge()` | override `createNode` / `createEdge` / `createSubgraph`, which the DSL calls; your `node()` is `g.$node()` |
| comparing a DSL with its model (`===`) | `false`: compare DSLs with DSLs (one model has one DSL), or use `modelOf()` |

`modelOf(dsl)` gives the model and `dsl(model)` the DSL. `toDot`, `fromModel`, the adapter's `toBlob` and `createRoot({ container })` / `renderToDot({ container })` of `@ts-graphviz/react` take either. The model guards (`isNodeModel` and the others) are false for a DSL, which is not a model: narrow DSLs by `$$type` (`if (s.$$type === 'Node')`), or check `modelOf(x)`. A DSL is not itself a model type, so pass `modelOf(g)` where a model is typed (such as `new Dot([modelOf(g)])` or a parameter of type `RootGraphModel`). `{ ...node }`, `Object.keys(node)` and `JSON.stringify(node)` list the attributes; `String(g)` does not work, since `toString` is an attribute name too.

## 2. Strings are literal text; DOT syntax is opt-in

In 3.x a string placed in a model was written into DOT with its backslashes passed through, so `\N` or `\l` kept their Graphviz meaning, and a string shaped like `<…>` with balanced brackets was written as an HTML-like label. In v4:

- A plain `string` is **literal text**. `toDot` escapes it completely and `fromDot` gives the same text back. A JavaScript newline (`'\n'`) is a line break.
- `escString(text)` marks a Graphviz escString: `\N`, `\G`, `\l`, `\n` and friends keep their meaning.
- `htmlLike(markup)` marks an HTML-like label. The markup must have balanced `<`/`>`.

| 3.x | v4 |
| --- | --- |
| `label: 'line1\\nline2'` (literal backslash-n) | `label: 'line1\nline2'` or `escString('line1\\nline2')` |
| `label: '\\N'` (node name substitution) | `label: escString('\\N')` |
| `label: '<<b>bold</b>>'` | `label: htmlLike('<b>bold</b>')` |
| string returned by `renderHTMLLike(...)` (React) | an `HTMLLikeValue`; pass it to the attribute, or use `.value` for the markup |

`isEscString` / `isHTMLLike` are type guards for the two kinds. When parsing, `\\` and `\"` become literal characters, any other backslash sequence yields an `escString`, and `<…>` yields an `htmlLike` value.

Numbers and booleans are typed in both directions: `width=1.5` parses to the number `1.5` and `fixedsize=true` to `true` (only when the numeral is exact; `001`, `1.`, `.5` and integers beyond 2^53 stay strings), and such values are written bare again.

## 3. Errors: standard types with a stable `code`

Errors have no shared custom base class. Every error the library raises on purpose is the standard type that fits (`SyntaxError`, `RangeError`, `TypeError`, a `DOMException` named `SecurityError`, `Error`) tagged with a `code` from `ERROR_CODES` (prefix `TSG_ERR_`), exported by `@ts-graphviz/common`. The code is the stable contract; messages may change in any release.

```ts
import { fromDot, isTsGraphvizError } from 'ts-graphviz';

const source = 'digraph { a -> }';

try {
  fromDot(source);
} catch (e) {
  if (isTsGraphvizError(e) && e.code === 'TSG_ERR_DOT_SYNTAX') {
    // e is a DotSyntaxError (a SyntaxError) with location information
  }
}
```

| Situation | v4 throws | `code` |
| --- | --- | --- |
| DOT does not parse | `DotSyntaxError` (`SyntaxError`) | `TSG_ERR_DOT_SYNTAX` |
| the parser failed for another reason (see `cause`) | `Error` | `TSG_ERR_PARSE_FAILED` |
| DOT exceeds a parse limit (`maxInputSize`, `maxASTNodes`, `maxNestingDepth`, `maxHtmlNestingDepth`, `maxEdgeChainDepth`) | `DotSyntaxError` whose `limit` names the option | `TSG_ERR_DOT_SYNTAX` |
| `toDot` / `fromModel` build an AST larger than `maxASTNodes` | `ASTNodeCountExceededError` (now a `RangeError`) | `TSG_ERR_AST_NODE_COUNT_EXCEEDED` |
| null character in text | `RangeError` | `TSG_ERR_NUL_CHARACTER` |
| unbalanced HTML-like markup | `RangeError` | `TSG_ERR_INVALID_HTML_LIKE` |
| `ArrowType.build()` given a shape Graphviz does not have, no shapes or more than four, or `none` last after another | `RangeError` | `TSG_ERR_INVALID_ARROW` |
| edge with fewer than two targets or a malformed target | `TypeError` (was a bare `Error`) | `TSG_ERR_INVALID_EDGE_TARGETS` |
| port containing `:` | `TypeError` | `TSG_ERR_INVALID_PORT` |
| attribute list kind other than `Graph`, `Node`, `Edge` | `TypeError` | `TSG_ERR_INVALID_ATTRIBUTE_LIST_KIND` |
| edges to subgraphs reach more than `maxEdgeTargets` nodes | `RangeError` | `TSG_ERR_EDGE_TARGET_COUNT_EXCEEDED` |
| no converter / printer plugin for a node or model | `Error` | `TSG_ERR_NO_PLUGIN` |
| an AST or model that contains itself (`stringify`, `toModel`, `fromModel`, `toDot`) | `TypeError` | `TSG_ERR_CYCLIC_STRUCTURE` |
| shared node objects reached more than `maxSharedNodes` times | `RangeError` | `TSG_ERR_SHARED_NODE_COUNT_EXCEEDED` |
| `fromDot` given an AST node that has no model | `TypeError` | `TSG_ERR_UNCONVERTIBLE_AST` |
| `fromDot` of a source without a graph | `Error` | `TSG_ERR_NO_GRAPH` |
| `fromDot` of a source with several graphs | `Error` | `TSG_ERR_MULTIPLE_GRAPHS` |
| a `GraphBase` subclass without a models context | `Error` | `TSG_ERR_NO_MODELS_CONTEXT` |
| adapter in a browser | `Error` | `TSG_ERR_UNSUPPORTED_ENVIRONMENT` |
| Graphviz command failed | `CommandExecutionError` (`Error`) | `TSG_ERR_COMMAND_FAILED` |
| Graphviz output over `maxOutputSize` | `RangeError` | `TSG_ERR_OUTPUT_LIMIT_EXCEEDED` |
| an adapter option outside its type or range | `TypeError` / `RangeError` | `TSG_ERR_INVALID_OPTION` |
| `sanitize` (and so the adapter) rejects the DOT | `DOMException` named `SecurityError` | `TSG_ERR_UNSAFE_DOT` |

Code that matched on `error.message` should match on `error.code`.

## 4. Model classes: no more `RootModelsContext` / `registerDefault`

3.x filled a shared `RootModelsContext` object when `ts-graphviz` was imported, which made `@ts-graphviz/core` and `@ts-graphviz/ast` depend on import order. In v4:

- `@ts-graphviz/core` exports `defaultModelsContext()` and `createModelsContext(partial)`. `registerDefault()` and `RootModelsContext` are gone; nothing mutates shared state on import. `createModelsContext` moved: import it from `@ts-graphviz/core` (or `ts-graphviz`), not `@ts-graphviz/common`.
- `ModelsContext` has a `Dot` constructor (see section 5); a context written out by hand must supply it, or be built with `createModelsContext`.
- `withContext({ Node: MyNode })` in `ts-graphviz` is unchanged.
- `toModel(ast, { models })` in `@ts-graphviz/ast` now **requires** `models` (the package has no classes of its own): pass `defaultModelsContext()` or `createModelsContext({...})`. `fromDot(source, { convert: { models } })` still takes a partial context.
- The constructor types in `ModelsContext` use the real signatures; a custom class whose constructor is incompatible is now a type error instead of a runtime surprise.
- `graph.with(models)` merges over the graph's current context instead of replacing it.

A direct subclass of `GraphBase` (rare) must override `defaultModels()` or call `with()` before creating nodes; the core classes do this for you.

## 5. The `Dot` model and symmetric conversions

A DOT source (comments and one or more root graphs) has a model of its own: `DotModel` / the `Dot` class (`graphs`, `addGraph`, `removeGraph`, `comment`).

- `fromModel(rootGraph)` returns a `Graph` AST node (3.x: a `Dot` wrapping it); `fromModel(dot)` returns a `Dot` node.
- `toModel(dotAst, { models })` returns a `DotModel` holding every graph (3.x: the root graph model).
- `toDot(rootGraph)` is unchanged and also accepts a `DotModel`.
- The parser accepts any number of root graphs, including none (3.x required exactly one).
- `fromDot(source)` returns the source's one root graph: a source with several graphs throws `TSG_ERR_MULTIPLE_GRAPHS`, and one without a graph `TSG_ERR_NO_GRAPH`. Read them all with the new `fromDotAll(dot, options?)`, which returns an array (empty for a source without graphs), or use `toModel(parse(source), { models })` for the whole document.

## 6. Attribute groups: one `comment`

`node.attributes.comment` and `edge.attributes.comment` are removed; use the model's `comment` (`node.$comment` / `edge.$comment` on a DSL), which is written before the statement. The Graphviz `comment` *attribute* is unaffected (`node.comment` on a DSL, `attributes.set('comment', ...)` on a model).

## 7. Generated attribute types

The attribute keys, their documentation and value types in `@ts-graphviz/common` are generated from the Graphviz documentation.

- Added: `radius` (edge); `beautify`, `linelength`, `oneblock`, `tooltip` (graph); `bb`, `cluster` (cluster); `cluster` (subgraph). Removed: `mosek`.
- `tailclip` is `boolean` (was `Point`); `tail_lp` is `Point` (was `string`).
- `ArrowType` (`arrowhead`, `arrowtail`) takes only the modifiers each shape takes in [Graphviz's table](https://graphviz.org/doc/info/arrows.html): `ldot`, `ocrow` and a two-shape name ending in `none` (`dotnone`) are type errors. Names of three or four shapes are made with `ArrowType.build()`, which checks each shape: `ArrowType.build('obox', 'ltee', 'vee')`. To find the names that changed, search for `arrowhead` and `arrowtail`.

The augmentation points (`Attribute.$keys`, `Attribute.$types`, `EdgeAttributeKey.$values`, …) are unchanged.

## 8. `@ts-graphviz/ast`

- Leaf nodes (`Literal`, `Attribute`, `Comment`, `NodeRef`) have no `children` and extend `ASTBaseNode` directly; `ASTBaseParentNode` is only for statement containers. `NodeRefList` keeps its references in `refs`, and `ASTChildNode<T>` resolves to `NodeRefASTNode` for it and to `never` for leaves. `location` is absent (not `null`) outside the parser. `createElement` keeps its three-argument form.
- The `*ASTPropaties` types are spelled `*ASTProperties`.
- **Graphs keep their contents in order**: `GraphBaseModel.statements` lists nodes, edges and subgraphs in the order they were added, and `toDot` writes them in that order (after the graph's attributes and leading default attribute lists; a default attribute list added after other statements is one of the statements, in its place) instead of all nodes, then subgraphs, then edges. Node order affects Graphviz's layout, so DOT read with `fromDot` now renders as its source did; a program that interleaves `node()` and `edge()` gets DOT in its own order. Custom classes implementing `GraphBaseModel` directly must add `statements` and `addAttributeList`. `ModelsContext`, `GraphBaseModel`, `RootGraphModel`, `SubgraphModel`, the constructor types and the model factories take an optional type parameter describing the model classes (`ModelTypes`, inferred by `createModelsContext` / `withContext` / `fromDot` with `convert.models`), so custom classes show in the types of `node()`, `edge()`, `subgraph()` and their callbacks; code that does not use custom classes sees the same types as before. Default attribute statements keep their place too (section 13).
- `parse` reads a whole DOT source. Its `startRule` option is deprecated (removed in 5.0): read fragments with `parseFragment(input, rule, options)`, a beta low-level API (`parse(s, { startRule: 'Edge' })` → `parseFragment(s, 'Edge')`). Using `startRule` reports a deprecation once, with code `TSG_DEP_PARSE_START_RULE`: to `onDeprecation` listeners on every runtime, on the `ts-graphviz:deprecation` diagnostics channel and as a Node.js `DeprecationWarning` (so `--no-deprecation` / `--throw-deprecation` apply) where the runtime has them. ts-graphviz writes nothing to the console itself; in a browser, subscribe with `onDeprecation` to see deprecations.
- `DotSyntaxError` has a `location` (`{ start, end }` with `offset`, `line`, `column`), or `undefined` when the error is not at a place (an input over `maxInputSize` or `maxASTNodes`), and a `limit`: the parse option whose limit the source exceeded (`'maxInputSize'`, `'maxASTNodes'`, `'maxNestingDepth'`, `'maxHtmlNestingDepth'` or `'maxEdgeChainDepth'`), or `undefined` for any other syntax error. Every DOT the parser refuses has the one code `TSG_ERR_DOT_SYNTAX`; read `limit` to tell a source that is too large or too deep (report it as such, or raise that option for trusted input) from a syntax error. Its `code`, `location` and `limit` are the contract; the message text and `cause` (the parser's internal error) are not and may change in any release, so do not read positions or limits from `cause`.
- Comments inside statements parse and are kept on the nearest node as `leadingComments` / `trailingComments` / `danglingComments`; code that walks every property of AST nodes will now also meet these arrays of `Comment` nodes. Locations of statements without `;` end at their last token.
- **Edge targets are what Graphviz has**: `EdgeTargetASTNode` is `NodeRef` (`a:p`), `NodeRefList` (`a:p, b` — a comma list, ports kept) or `Subgraph` (`{ a b }`, `subgraph s { ... }` with any statements; the target is every node in it). `NodeRefGroup` is gone: `{a b}` parses as an anonymous `Subgraph` of `Node` statements, whose ports Graphviz always ignored. `toDot` writes a model group with a port or compass point as a comma list, so the ports now reach Graphviz (they were silently dropped inside `{...}`); groups without ports are still written `{a b}`. The parser also reads comma lists (`a, b -> c`, `a, b [shape=box];`) and subgraphs as edge targets, and the location of an edge without `;` no longer includes the whitespace after it.
- `Literal`'s `quoted: boolean | 'html'` is replaced by `kind: 'bare' | 'quoted' | 'html'` (`LiteralKind`): `quoted: false` → `kind: 'bare'`, `quoted: true` → `kind: 'quoted'`, `quoted: 'html'` → `kind: 'html'`. The old field mixed how a string is written (bare or quoted, which Graphviz reads the same) with what it is (an HTML-like value), and `if (literal.quoted)` was also true for HTML strings.
- A quoted `Literal` holds the raw source text (escape sequences intact) and `stringify` writes it back verbatim; escaping and unescaping happen in the model ⇄ AST conversion.
- The `maxNestingDepth` print option is removed: `stringify` prints an AST of any depth. The `maxNestingDepth` parse option (default 100) is unchanged.

Parser fixes you may notice: all compass points parse (`ne`, `sw`, `c`, `_`, and `a:n` as a compass point), bare identifiers may contain any non-ASCII character, and raw newlines inside quoted strings survive `stringify`.

## 9. `@ts-graphviz/adapter`

- **`toBlob` checks the source with `sanitize` first** (from `@ts-graphviz/ast`, now a dependency of the adapter). DOT that makes Graphviz read a file (`image`, `shapefile`, `imagepath`, `fontpath`, `stylesheet`, xdot drawing programs, font paths, `<IMG>`), write a link other than relative, `http`, `https` or `mailto`, or put raw text into PostScript, image map, `plain`, JSON or XML output (font names other than plain names, unknown `style` values, colors with whitespace, control characters, line breaks in names); `ismap` and output formats that have not been checked (e.g. `vml`, `fig`) are refused. Such DOT rejects with a `DOMException` named `SecurityError` (code `TSG_ERR_UNSAFE_DOT`), and DOT that does not parse rejects with `DotSyntaxError` instead of a `CommandExecutionError` from `dot`. With `sanitize` on, the command gets the source as reprinted by the parser. If your application renders its own images or relies on Graphviz's error messages, pass `sanitize: false`: the source then reaches Graphviz unchanged, without parsing, and DOT that does not parse fails with a `CommandExecutionError` from `dot`; to raise the parser limits, pass them as `sanitize: { maxASTNodes: … }`.
- **`toStream` and `toFile` are replaced by `toBlob`**, which takes the same options and returns the output as a `Blob` once `dot` has succeeded. Its `type` is the media type of the format (`image/svg+xml`, `image/png`, …), or empty for formats without a well-known one.

  ```ts
  // v3
  const stream = await toStream(dot, { format: 'svg' });
  stream.pipe(process.stdout);
  await toFile(dot, './result.svg', { format: 'svg' });

  // v4
  import { writeFile } from 'node:fs/promises';
  import { Writable } from 'node:stream';

  const blob = await toBlob(dot, { format: 'svg' });
  await blob.stream().pipeTo(Writable.toWeb(process.stdout));
  await writeFile('./result.svg', blob.stream());
  ```

  The adapter no longer writes files: choosing the path is your application's job (on Deno it needs no `--allow-write`). For the Node.js stream API, use `Readable.fromWeb(blob.stream())`.
- `ts-graphviz/adapter`'s `toBlob` also accepts a model and calls `toDot` for you.
- Command failures reject with `CommandExecutionError` (`command`, `exit.code`, `exit.signal`, `exit.stderr`, `cause`), including a failure to write the DOT source to the command.
- `-G`/`-N`/`-E` attribute values are passed verbatim (3.x wrapped values containing whitespace in literal quotes). fdp `grid` and `oldAttractive` follow the Graphviz defaults (grid on, old attractive force off).
- The browser entry is typed with the real `Options`.

## 10. `@ts-graphviz/react`

- React 19.3 or later is required (`react-reconciler` 0.34).
- `useDigraph`, `useGraph`, `useSubgraph`, `useNode` and `useEdge` are removed. The components are host elements of the renderer, which adds the models when React commits: render `<Digraph>`, `<Subgraph>`, `<Node>` and `<Edge>`, and get a model through `ref` or, for the enclosing graph, `useCurrentGraph()`.
- The statements of a graph follow the element tree, also across re-renders (reordered, inserted and removed children), and StrictMode, Suspense or a discarded render no longer adds statements twice or leaves them behind.
- In container mode, a re-render replaces only the statements the renderer added before; statements the container already had stay first. Models are made by the graph they go to (`createNode` / `createEdge` / `createSubgraph`), so a graph class that overrides them still applies.
- `createRoot` and `renderToDot` take a `models` option.
- `render()` / `renderToDot()` resolve once the tree has settled, including transitions, deferred values and suspended data. `timeout` is replaced by a per-render `signal` (`AbortSignal.timeout(ms)` for a time limit). Uncaught errors reject with the error itself, and the error callbacks receive `error: unknown`.
- `<Digraph strict>` / `<Graph strict>` render strict graphs.
- `renderHTMLLike` returns an `HTMLLikeValue` (see section 2).
- As in 0.12, `renderHTMLLike` (and so a JSX `label`) writes strings as text: text children are written with `&`, `<` and `>` as entities, and attribute values also with `"`. Write markup as elements (`<dot:td><dot:b>x</dot:b></dot:td>`), not as a string (`<dot:td>{'<b>x</b>'}</dot:td>`).
- `<dot:port>` is removed: HTML-like labels have no port element, and Graphviz rejected its output. Use the `port` attribute: `<dot:td port="p">`.
- `renderHTMLLike` throws instead of logging a warning and returning an empty label: `RangeError` past `maxDepth`; `TypeError` for a circular tree, an element HTML-like labels do not have (`<div>`, `<span>`, …), an attribute name that is not a name, or an object among the children that is not a React element. Errors from components are no longer swallowed.

## 11. Small behaviour fixes

- The DSL's `subgraph('')` finds or creates the subgraph with the empty id (3.x created a new anonymous one); `edge(targets, null)` ignores the `null`.
- `fromModel` keeps a graph or subgraph id that is the empty string; `stringify` of an empty `Dot` returns `''`.
- `ts-graphviz/ast` and `ts-graphviz/adapter` resolve under `moduleResolution: node10` (`typesVersions`).

## 12. Read-only model types

`@ts-graphviz/common` has read-only views of the models: `ReadonlyNodeModel`, `ReadonlyEdgeModel`, `ReadonlySubgraphModel`, `ReadonlyRootGraphModel`, `ReadonlyDotModel`, `ReadonlyAttributeListModel` and `ReadonlyAttributes`, with the union `AnyReadonlyDotObjectModel` and the value type `DotValue` (`string | number | boolean | EscStringValue | HTMLLikeValue`). They hold only what reading needs (ids, attributes as `size` / `values` / `get(key)`, the contents of a graph), so every model fits them: the built-in ones, the classes of `@ts-graphviz/core`, and your own model classes.

- **Readers take any model.** `toDot`, `fromModel` / `FromModelConverter` (`@ts-graphviz/ast`) and the model input of `ts-graphviz/adapter`'s `toBlob` (`DotInput`) take an `AnyReadonlyDotObjectModel` (or its DOT DSL, see section 1) instead of a `DotObjectModel`. Every model is still accepted; an object that only has a `$$type` (such as `{ $$type: 'Node' }`) no longer compiles.
- **Edge targets are read-only references.** `NodeRef` is `ReadonlyNodeModel | ForwardRefNode` (3.x: `NodeModel | ForwardRefNode`): an edge uses only the id of a target node, so any node model can be one. Reading `edge.targets` gives read-only nodes; to change a target node, look it up in the graph (`graph.getNode(target.id)`). An array of nodes cast to the tuple type (`nodes as EdgeTargetTuple`) no longer compiles; cast it to a tuple of nodes instead (`nodes as [NodeModel, NodeModel]`).
- **Type guards on an unknown value narrow to the read-only types.** `isNodeModel(value)` on `unknown` gives `ReadonlyNodeModel` (3.x: `NodeModel`; on another object type such as `DotObjectModel`, its intersection with `ReadonlyNodeModel`), and likewise `isEdgeModel`, `isSubgraphModel`, `isRootGraphModel`, `isDotModel` and `isAttributeListModel`: the check looks at `$$type` and a few fields, which cannot tell a writable model from another object. Given a model, a guard keeps your type: on `AnyDotObjectModel` (or a union of your own classes) `isNodeModel` narrows to `NodeModel` (or your node class), and `models.filter(isNodeModel)` is still a `NodeModel[]` (on `unknown[]`, a `ReadonlyNodeModel[]`). If you need the writable model from an unknown value, keep the model where you created it, or look it up by id in its graph.

To write a function that takes any node (or graph) and only reads it, type its parameter with the read-only type:

```ts
import type { ReadonlyNodeModel, ReadonlyRootGraphModel } from 'ts-graphviz';

function describe(node: ReadonlyNodeModel): string {
  return `${node.id}: ${String(node.attributes.get('label') ?? '')}`;
}

function countNodes(graph: ReadonlyRootGraphModel): number {
  return graph.nodes.length;
}
```

A function that changes the node keeps taking `NodeModel` (or your class).

A read-only type says only that the function taking it does not change the model; it is checked by TypeScript, not at run time. Models are not frozen: `toDot(g)` leaves `g` as it was, and `g` can be changed afterwards as before. Do not cast a read-only model back to a writable type to change it.

## 13. Default attribute statements keep their place

In DOT, a default attribute statement (`node [...]`, `edge [...]`) applies only to what follows it; `graph [...]` sets the graph's own attributes wherever it is written, and the defaults of the subgraphs that follow it. 3.x merged every one into one set of defaults per graph (`attributes.node` and so on), written first, so a default given after other statements applied to what came before it too. v4 keeps each where it was written:

```ts
import { digraph } from 'ts-graphviz';

digraph((g) => {
  g.node('a');
  g.node({ shape: 'box' }); // 3.x: a is a box too; v4: only what follows
  g.node('b');
});
```

- What changes: a default given after other statements (in the DSL, `g.node({ ... })`, `g.edge({ ... })`, `g.graph({ ... })`; on a model, `addAttributeList`), and a DOT source with several statements of one kind read with `fromDot` (it now renders as its source does). A program that gives every default before its other statements (or with `attributes.node.set(...)`) and none after them renders as before: the leading defaults apply to every statement. Where a default is also given after other statements, it overrides the leading one for what follows it.
- To keep the 3.x output, import from `ts-graphviz/legacy` (the same API with the 3.x classes), or pass `legacyModels` as the models context (`withContext(legacyModels)`, `fromDot(source, { convert: { models: legacyModels } })`). Both are deprecated and removed in v5.
- `addAttributeList(kind, attributes)` returns the list it adds (the DSL's `g.node({ ... })` returns its DSL); keep it to change those defaults later.
- `graph.attributes` (and the DSL's `$attributes`) is deprecated, removed in v5: it is the leading defaults only. Write a default attribute statement instead.

See the [Security model](../../11-advanced-topics/06-security-model.md) for what the library guarantees at each trust boundary in v4.
