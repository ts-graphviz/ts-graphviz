---
"@ts-graphviz/ast": patch
---

Keep asterisks inside block comments when parsing. Only the leading `*` of each line (the decoration the printer writes) is removed, so `/* a*b */` no longer becomes `ab` (#1625).
