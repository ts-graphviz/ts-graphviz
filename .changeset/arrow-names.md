---
"@ts-graphviz/common": major
---

Arrow names follow Graphviz's table of arrow shapes, and `ArrowType.build()` makes names of up to four shapes

`ArrowType` (the type of `arrowhead` and `arrowtail`) takes the modifiers each shape takes in Graphviz's table: `o` on `box`, `diamond`, `dot`, `inv` and `normal`; `l` / `r` on any shape but `dot` and `none`. A name of two shapes does not end in `none`. Names that Graphviz does not draw as written, such as `ldot`, `ocrow` or `dotnone`, are type errors now.

Graphviz takes up to four shapes in one name. The literals cover one or two; `ArrowType.build()` makes a name of up to four, checking each shape, and gives an `ArrowType.Built`, which `ArrowType` takes:

```ts
import { ArrowType } from 'ts-graphviz';

edge.attributes.set('arrowhead', ArrowType.build('obox', 'ltee', 'vee'));
// arrowhead = "oboxlteevee"
```

At run time an `ArrowType.Built` is the name itself, a string. `ArrowType.build()` throws a `RangeError` with the code `TSG_ERR_INVALID_ARROW` for a shape Graphviz does not have, for no shapes or more than four, and for `none` last after another shape.

The union of literals is smaller: 1,764 names, down from 4,422. Deep type comparisons over it, such as expect-type's `toEqualTypeOf`, now finish; on the old union they ran out of memory on TypeScript 5.0, 6.0 and 7.0 (measured in #1897).
