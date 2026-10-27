---
"@ts-graphviz/ast": patch
---

Keep the source order of attributes when converting DOT to models

In 3.x, `toModel` / `fromDot` passed attributes through plain objects, which enumerate integer-like keys (`0`, `"12"`) before other keys, so `toDot(fromDot('graph { a = 1; 0 = 2; }'))` moved `0` first. Attributes keep the order of the DOT source. Models built with attribute objects in your own code still follow JavaScript's object key order.
