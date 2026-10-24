---
"@ts-graphviz/ast": patch
---

Fix parsing of backslash-newline line continuations in quoted strings

A quoted string containing a backslash followed by a newline (LF, CRLF or CR) kept the continuation marker in the parsed value, and the CRLF form failed to parse. The lines are now joined as Graphviz does, so `"one\<newline>two"` parses as `onetwo`.
