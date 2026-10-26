---
"@ts-graphviz/adapter": patch
---

`toFile` opens the output file and writes it with positional arguments only, without an options object, so the whole output always replaces the file at the given path.
