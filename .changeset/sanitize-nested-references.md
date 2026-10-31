---
"@ts-graphviz/ast": patch
---

`sanitize` says that a value has character references nested too deep to check (more than eight rounds of decoding) instead of reporting a control character.
