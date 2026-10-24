---
"@ts-graphviz/ast": patch
---

Parse bare identifiers made of any non-ASCII characters, as Graphviz does

Graphviz treats every byte above 0x7F as an identifier character, so `dot -Tcanon` prints values such as `label=￠` or `label=😀` without quotes. The grammar only accepted Unicode letters in bare identifiers and rejected such output; it now accepts any non-ASCII character.
