---
"@ts-graphviz/adapter": major
"@ts-graphviz/common": minor
---

Bound and control the Graphviz process; fix the Deno entry

- New `signal` option: the command is killed when the signal aborts and the call rejects with `signal.reason`. Use `AbortSignal.timeout(ms)` for a time limit; layout cost depends on the DOT source.
- New `maxOutputSize` option (default 128 MiB, `0` disables): a command that writes more is killed and the call rejects with a `RangeError` whose `code` is `TSG_ERR_OUTPUT_LIMIT_EXCEEDED`. `CommandExecutionError.exit.stderr` keeps the last 64 KiB of the command's stderr.
- An argument the OS cannot pass (e.g. containing a NUL character) rejects with `CommandExecutionError` instead of Node's raw `TypeError`.
- Deno: in 3.x, a non-zero exit resolved with an empty stream and printed the error, and a missing command rejected with Deno's `NotFound`. Both now reject with `CommandExecutionError` (with the stderr for a non-zero exit). `toFile` writes the file only after the command succeeded.
