---
"@ts-graphviz/adapter": patch
---

On Node.js, a failure of the `dot` command's pipes rejects the call with `CommandExecutionError`, and the call always settles:

- A failure while writing the DOT source to stdin, including a command that closes its input before reading all of it, kills the command; the rejection carries the exit status and stderr, with the write failure as `cause`. If the command has not exited within a second of the kill, the call rejects with the write failure.
- A read error on stdout or stderr kills the command and rejects, with the pipe's error as `cause`.
- A failure to kill the command does not replace the original failure.
