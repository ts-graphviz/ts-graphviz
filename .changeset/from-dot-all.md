---
"@ts-graphviz/common": major
"ts-graphviz": major
---

`fromDot` no longer drops all graphs but the first: a DOT source with more than one graph throws an `Error` with code `TSG_ERR_MULTIPLE_GRAPHS`. The new `fromDotAll(dot, options?)` returns the models of every graph, in order. `fromDot` also stops passing its `parse.startRule` to the deprecated `parse` option, so it reports no deprecation.
