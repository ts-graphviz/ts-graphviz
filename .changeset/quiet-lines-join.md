---
"@ts-graphviz/ast": patch
---

Fix parsing of backslash-newline line continuations in quoted strings

A quoted string containing a backslash followed by a newline kept the continuation marker in the parsed value. The lines are now joined as Graphviz does, so `"one\<newline>two"` parses as `onetwo`. As in Graphviz, only backslash + LF is a continuation.
