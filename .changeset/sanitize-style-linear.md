---
"@ts-graphviz/ast": patch
---

`sanitize` checks a `style` value in time linear in its length. A long `setlinewidth(…)` argument took time quadratic in its length (about 6 s for 100 000 digits); the check now reads the value in a single pass and accepts the same values as before.
