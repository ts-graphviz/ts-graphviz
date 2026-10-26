---
"@ts-graphviz/ast": patch
---

`parse` attaches comments inside statements (`a -> /* c */ b`) in time linear in the number of comments; it took quadratic time (about 21 s for 20 000 such edges). Each of these comments now counts toward `maxASTNodes`, like any other node.
