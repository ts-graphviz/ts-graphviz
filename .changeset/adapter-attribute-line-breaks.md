---
"@ts-graphviz/adapter": patch
---

With `sanitize` on (the default), `toStream` / `toFile` reject an `attributes` key or value that contains a line break (`SecurityError`, code `TSG_ERR_UNSAFE_DOT`). The attributes are checked through a DOT copy, and a backslash before a line break is a line continuation in a DOT string, so such a line break passed the check and reached Graphviz in the argument. The line break is now checked on the exact argument text, and the check and the command line are built from the same arguments. A key or value with a backslash before a quote or at its end, which the DOT copy cannot hold as it is, is rejected the same way instead of failing with a `DotSyntaxError`.
