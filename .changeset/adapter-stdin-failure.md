---
"@ts-graphviz/adapter": patch
---

A failure while writing the DOT source to the command's stdin, including a command that closes its input before reading all of it, rejects the call with `CommandExecutionError`. In 3.x it surfaced as an unhandled promise rejection, and the call could still resolve.
