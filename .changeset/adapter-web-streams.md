---
"@ts-graphviz/adapter": major
"ts-graphviz": major
---

Adapter: Web `ReadableStream` on every runtime, typed browser entry, `CommandExecutionError`, models as input

- `toStream` returns a Web `ReadableStream<Uint8Array>` on Node.js, as it already did on Deno. In 3.x it returned a Node.js stream. Code that used the Node stream API on the result (`stream.pipe(...)`, `'data'` events) should use `stream.pipeTo(...)`, `for await`, or `Readable.fromWeb(stream)`.
- The browser entry has the real `Options`/`Layout` types instead of `any` and re-exports the type definitions, so misuse is a type error; it throws an `Error` with `code: 'TSG_ERR_UNSUPPORTED_ENVIRONMENT'`.
- Failures of the Graphviz command reject with the new `CommandExecutionError` (an `Error` with `code: 'TSG_ERR_COMMAND_FAILED'`, exported by the Node.js and Deno entries) with `command` and, when the command started, `exit` (`code`, `signal` as `string | null`, `stderr`); `exit` is `undefined` when it could not start, so check it before reading its fields. `cause` holds the underlying error, when there is one. Its message holds at most 256 characters of the command and 1024 characters of the detail (the exit status and the start of the kept stderr), with a note of how much was left out, and writes C0 controls other than tab and line feed, DEL, C1 controls, lone surrogates, the line and paragraph separators and the bidirectional formatting characters as `\xNN` / `\uNNNN`; the output-limit `RangeError` does the same for the command. `exit.stderr` keeps the last 64 KiB of the command's stderr, decoded as UTF-8 and not escaped. The message and `exit.stderr` can contain file paths and parts of the DOT source; do not show them to end users verbatim. In 3.x the Node.js entry rejected with a bare `Error` (for the Deno entry, see the process controls note).
- `ts-graphviz/adapter`: `toStream` and `toFile` also accept a model (root graph, `Dot`, node, edge or subgraph) and render it with `toDot` first.
