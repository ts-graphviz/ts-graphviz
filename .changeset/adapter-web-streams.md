---
"@ts-graphviz/adapter": major
"ts-graphviz": major
---

Adapter: Web `ReadableStream` on every runtime, typed browser entry, `CommandExecutionError`, models as input

- `toStream` returns a Web `ReadableStream<Uint8Array>` on Node.js, as it already did on Deno. In 3.x it returned a Node.js stream. Code that used the Node stream API on the result (`stream.pipe(...)`, `'data'` events) should use `stream.pipeTo(...)`, `for await`, or `Readable.fromWeb(stream)`.
- The browser entry has the real `Options`/`Layout` types instead of `any` and re-exports the type definitions, so misuse is a type error; it throws an `Error` with `code: 'TSG_ERR_UNSUPPORTED_ENVIRONMENT'`.
- Failures of the Graphviz command reject with the new `CommandExecutionError` (an `Error` with `code: 'TSG_ERR_COMMAND_FAILED'`, exported by the Node.js and Deno entries) with `command` and, when the command started, `exit` (`code`, `signal` as `string | null`, `stderr`); `exit` is `undefined` when it could not start, so check it before reading its fields. `cause` holds the underlying error, when there is one. In 3.x the Node.js entry rejected with a bare `Error` (for the Deno entry, see the process controls note).
- `ts-graphviz/adapter`: `toStream` and `toFile` also accept a model (root graph, `Dot`, node, edge or subgraph) and render it with `toDot` first.
