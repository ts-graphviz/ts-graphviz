---
"@ts-graphviz/adapter": patch
---

Keep exactly the last 64 KiB of a failed command's stderr in `CommandExecutionError.exit.stderr`. Whole chunks were dropped, so much less could be kept (a 64 KiB write followed by a 1-byte write kept 1 byte). The stderr is decoded as UTF-8; a character cut at the start of the kept bytes is left out instead of appearing as U+FFFD.
