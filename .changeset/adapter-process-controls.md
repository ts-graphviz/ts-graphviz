---
"@ts-graphviz/adapter": major
"@ts-graphviz/common": minor
---

Bound and control the Graphviz process; fix the Deno entry

- New `signal` option: the command is killed when the signal aborts and the call rejects with `signal.reason`. Use `AbortSignal.timeout(ms)` for a time limit; layout cost depends on the DOT source.
- New `maxOutputSize` option (default 128 MiB, `0` disables): a command that writes more is killed and the call rejects with a `RangeError` whose `code` is `TSG_ERR_OUTPUT_LIMIT_EXCEEDED` (new in `ERROR_CODES`). The command's stderr is kept to its last 64 KiB.
- An argument the OS cannot pass (e.g. containing a NUL character) rejects with `CommandExecutionError` instead of Node's raw `TypeError`.
- `CommandExecutionError.exit.signal` is typed `string | null` (was `NodeJS.Signals | null`) so the class is shared by the Node.js and Deno entries.
- Deno: a non-zero exit now rejects with `CommandExecutionError` and the stderr (it resolved with an empty stream and printed the error); a missing command rejects with `CommandExecutionError` (was Deno's `NotFound`); `toFile` truncates an existing file (a shorter output left the old file's tail in place) and writes only after the command succeeded. The Deno entry exports `CommandExecutionError`.
