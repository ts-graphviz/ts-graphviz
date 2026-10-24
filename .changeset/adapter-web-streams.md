---
"@ts-graphviz/adapter": major
"ts-graphviz": major
---

Adapter: Web `ReadableStream` on every runtime, typed browser entry, models as input

- `toStream` now returns a Web `ReadableStream<Uint8Array>` on Node.js (via `Readable.toWeb`) as it already did on Deno. Code that used the Node stream API on the result (`stream.pipe(...)`, `'data'` events) should use `stream.pipeTo(...)`, `for await`, or `Readable.fromWeb(stream)`.
- The browser entry has the real `Options`/`Layout` types instead of `any` and re-exports the type definitions, so misuse is a type error; it throws `UnsupportedEnvironmentError`.
- Failures of the Graphviz command are reported as `CommandExecutionError` (a `TsGraphvizError`) with `command`, `exit.code`, `exit.signal`, `exit.stderr` and `cause`; the messages are unchanged.
- `ts-graphviz/adapter`: `toStream` and `toFile` also accept a model (root graph, `Dot`, node, edge or subgraph) and render it with `toDot` first.
