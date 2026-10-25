---
"@ts-graphviz/ast": patch
"ts-graphviz": patch
---

Fix: converting DOT to a model kept only the last statement for a node mentioned more than once (`a [color=red]; a [shape=box]` lost `color`). The statements now add up, as in Graphviz.
