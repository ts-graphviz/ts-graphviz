---
"@ts-graphviz/adapter": major
---

Reject a `.bat` or `.cmd` `dotCommand` on Windows

On Windows, `toBlob` (Node.js and Deno) rejects a `dotCommand` whose name ends in `.bat` or `.cmd` (any case, also with trailing dots or spaces, which Windows strips) with `CommandExecutionError` (`code` `TSG_ERR_COMMAND_FAILED`) before starting it. Windows runs such a script through `cmd.exe`, which parses the command line again with its own rules, so the arguments would not reach Graphviz as given. Current Node.js releases refuse to start one without a shell, and Deno's handling differs between releases; the adapter behaves the same on both. Point `dotCommand` at `dot.exe` instead. On other platforms a file named `*.bat` is started like any other executable.
