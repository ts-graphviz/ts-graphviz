---
"@ts-graphviz/adapter": minor
---

Bound and escape the message of `CommandExecutionError`

The message held the whole kept stderr (up to 64 KiB) as written, including terminal escape sequences. It now holds at most 256 characters of the command and 1024 characters of the detail (the exit status and the start of the kept stderr), with a note of how much was left out. These characters are escaped as `\xNN` / `\uNNNN`: C0 controls other than tab and line feed, DEL, C1 controls, lone surrogates, the line and paragraph separators and the bidirectional formatting characters. The output-limit `RangeError` escapes and cuts the command in the same way. `exit.stderr` keeps the stderr as the command wrote it. Its JSDoc now says that it and the message can contain file paths and parts of the DOT source, and should not be shown to end users verbatim.
