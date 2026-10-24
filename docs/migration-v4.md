# Migrating to ts-graphviz v4

v4 is the release where the API review of the 3.x line landed: attribute values became explicit about what they mean, errors became identifiable, the model classes stopped depending on import order, and the AST was tidied. Most programs that build a graph with the factory API and call `toDot` keep working unchanged. This guide lists every change that can affect existing code, by area, with what to do about it.

Requirements: **Node.js 22 or later** (Node.js 20 reached end of life). Deno and browsers are supported as before.

## 1. Strings are literal text; DOT syntax is opt-in

In 3.x a string placed in a model was written into DOT more or less as is, so a value could break out of the quoted string (a DOT injection) and any string shaped like `<…>` was silently treated as an HTML-like label. In v4:

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

## 2. Errors: standard types with a stable `code`

There is no `TsGraphvizError` base class. Every error the library raises is the standard type that fits (`SyntaxError`, `RangeError`, `TypeError`, `Error`) tagged with a `code` from `ERROR_CODES` (prefix `TSG_ERR_`), exported by `@ts-graphviz/common`. The code is the stable contract; messages may change in any release.

```ts
import { isTsGraphvizError } from 'ts-graphviz';

try {
  fromDot(source);
} catch (e) {
  if (isTsGraphvizError(e) && e.code === 'TSG_ERR_DOT_SYNTAX') {
    // e is a DotSyntaxError (a SyntaxError) with location information
  }
}
```

| Situation | v4 throws | `code` | 3.x threw |
| --- | --- | --- | --- |
| DOT does not parse | `DotSyntaxError` (`SyntaxError`) | `TSG_ERR_DOT_SYNTAX` | same |
| AST exceeds `maxASTNodes` | `ASTNodeCountExceededError` (`RangeError`) | `TSG_ERR_AST_NODE_COUNT_EXCEEDED` | `Error` subclass |
| null character / unbalanced HTML-like | `RangeError` | `TSG_ERR_NUL_CHARACTER` / `TSG_ERR_INVALID_HTML_LIKE` | not detected |
| edge with fewer than two targets | `TypeError` | `TSG_ERR_INVALID_EDGE_TARGETS` | bare `Error` |
| no plugin for a node / model | `Error` | `TSG_ERR_NO_PLUGIN` | bare `Error()` |
| `fromDot` of a source without a graph | `Error` | `TSG_ERR_NO_GRAPH` | bare `Error` |
| adapter in a browser | `Error` | `TSG_ERR_UNSUPPORTED_ENVIRONMENT` | bare `Error` |
| Graphviz command failed | `CommandExecutionError` (`Error`) | `TSG_ERR_COMMAND_FAILED` | bare `Error` |

Code that matched on `error.message` should match on `error.code`.

## 3. Model classes: no more `RootModelsContext` / `registerDefault`

3.x filled a shared `RootModelsContext` object when `ts-graphviz` was imported, which made `@ts-graphviz/core` and `@ts-graphviz/ast` depend on import order. In v4:

- `@ts-graphviz/core` exports `defaultModelsContext()` and `createModelsContext(partial)`. `registerDefault()` and `RootModelsContext` are gone; nothing mutates shared state on import.
- `withContext({ Node: MyNode })` in `ts-graphviz` is unchanged.
- `toModel(ast, { models })` in `@ts-graphviz/ast` now **requires** `models` (the package has no classes of its own): pass `defaultModelsContext()` or `createModelsContext({...})`. `fromDot(source, { convert: { models } })` still takes a partial context.
- The constructor types in `ModelsContext` use the real signatures; a custom class whose constructor is incompatible is now a type error instead of a runtime surprise.
- `graph.with(models)` merges over the graph's current context instead of replacing it.

A direct subclass of `GraphBase` (rare) must override `defaultModels()` or call `with()` before creating nodes; the core classes do this for you.

## 4. The `Dot` model and symmetric conversions

A DOT source (comments and one or more root graphs) has a model of its own: `DotModel` / the `Dot` class (`graphs`, `addGraph`, `removeGraph`, `comment`).

- `fromModel(rootGraph)` returns a `Graph` AST node (3.x: a `Dot` wrapping it); `fromModel(dot)` returns a `Dot` node.
- `toModel(dotAst)` returns a `DotModel` holding every graph (3.x: the first graph only).
- `toDot(rootGraph)` is unchanged and also accepts a `DotModel`; `fromDot(source)` still returns the first root graph. Use `toModel(parse(source), { models })` for the whole document.
- The parser accepts any number of root graphs, including none.

## 5. Attribute groups: one `comment`

`node.attributes.comment` and `edge.attributes.comment` are removed; use `node.comment` / `edge.comment`, which is written before the statement. The Graphviz `comment` *attribute* is unaffected (`attributes.set('comment', ...)`).

## 6. Generated attribute types

The attribute keys, their documentation and value types in `@ts-graphviz/common` are generated from the Graphviz documentation.

- Added: `radius` (edge); `beautify`, `linelength`, `oneblock`, `tooltip` (graph); `bb`, `cluster` (cluster); `cluster` (subgraph). Removed: `mosek`.
- `tailclip` is `boolean` (was `Point`); `tail_lp` is `Point` (was `string`).

The augmentation points (`Attribute.$keys`, `Attribute.$types`, `EdgeAttributeKey.$values`, …) are unchanged.

## 7. `@ts-graphviz/ast`

- Leaf nodes (`Literal`, `Attribute`, `Comment`, `NodeRef`) have no `children`; `NodeRefGroup` keeps its references in `refs`; `location` is absent (not `null`) outside the parser. `createElement` keeps its three-argument form.
- The `*ASTPropaties` types are spelled `*ASTProperties`.
- A quoted `Literal` holds the raw source text (escape sequences intact) and `stringify` writes it back verbatim; escaping and unescaping happen in the model ⇄ AST conversion.
- The shared `createElement` no longer counts nodes across calls; use `createElementFactory({ maxASTNodes })` for a limit.

Parser fixes you may notice: all compass points parse (`ne`, `sw`, `c`, `_`, and `a:n` as a compass point), block comments keep their `*`, bare identifiers may contain any non-ASCII character, and raw newlines inside quoted strings survive `stringify`.

## 8. `@ts-graphviz/adapter`

- `toStream` returns a Web `ReadableStream<Uint8Array>` on every runtime (Node.js included). Replace `stream.pipe(dest)` with `stream.pipeTo(Writable.toWeb(dest))`, `for await (const chunk of stream)`, or `Readable.fromWeb(stream)`.
- `ts-graphviz/adapter`'s `toStream` / `toFile` also accept a model and call `toDot` for you.
- Command failures reject with `CommandExecutionError` (`command`, `exit.code`, `exit.signal`, `exit.stderr`, `cause`), including a failure to write the DOT source to the command.
- `-G`/`-N`/`-E` attribute values are passed verbatim (3.x wrapped values containing whitespace in literal quotes). fdp `grid` and `oldAttractive` follow the Graphviz defaults (grid on, old attractive force off).
- The browser entry is typed with the real `Options`.

## 9. `@ts-graphviz/react`

- `useDigraph` / `useGraph` / `useSubgraph` create models through the `GraphvizContext`'s models; `createRoot` and `renderToDot` take a `models` option. A hand-written `GraphvizContext` value must include `models` (use `createModelsContext()`).
- `<Digraph strict>` / `<Graph strict>` render strict graphs.
- `renderHTMLLike` returns an `HTMLLikeValue` (see section 1).

## 10. Small behaviour fixes

- `subgraph('')` finds or creates the subgraph with the empty id (3.x created a new anonymous one); `edge(targets, null)` ignores the `null`.
- `fromModel` keeps a graph or subgraph id that is the empty string; `stringify` of an empty `Dot` returns `''`.
- `ts-graphviz/ast` and `ts-graphviz/adapter` resolve under `moduleResolution: node10` (`typesVersions`).

See [docs/security-model.md](./security-model.md) for what the library guarantees at each trust boundary in v4.
