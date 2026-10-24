---
"@ts-graphviz/ast": patch
---

Escape the ids and ports of grouped edge targets (`a -> {b c}`) when converting a model to an AST, as direct targets already are. A quote in a grouped target's id no longer breaks the DOT output (#1620).
