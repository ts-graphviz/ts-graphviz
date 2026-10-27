---
"@ts-graphviz/adapter": major
---

Reject a `.bat` or `.cmd` `dotCommand` on Windows

On Windows, `toStream` and `toFile` (Node.js and Deno) reject a `dotCommand` whose name ends in `.bat` or `.cmd` (any case, also with trailing dots or spaces, which Windows strips) with `CommandExecutionError` (`code` `TSG_ERR_COMMAND_FAILED`) before starting it. Windows runs such a script through `cmd.exe`, which parses the command line again with its own rules, so the arguments would not reach Graphviz as given. Node.js already refuses to start one without a shell, and Deno's handling has changed between releases; the adapter now behaves the same on both. Point `dotCommand` at `dot.exe` instead. Other platforms are unchanged: there a file named `*.bat` is started like any other executable.
