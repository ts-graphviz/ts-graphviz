---
"@ts-graphviz/common": major
"@ts-graphviz/ast": minor
"@ts-graphviz/adapter": major
"ts-graphviz": major
---

A schema names the formats and layouts of Graphviz plugins, and `sanitize` and the adapter take it

- `values.extend` and `values.override` also take names instead of a type argument, `values.extend('mp4', 'webm')`, and an entry made so has them at run time as its `values`.
- A schema's `types` takes `format` and `layout`: the output formats and layout engines a Graphviz plugin adds, as `values.extend('mp4')` with the names (an entry without names, or `values.override`, throws `TSG_ERR_INVALID_SCHEMA`).
- The adapter's `toBlob` takes `schema` (trusted configuration, checked as `defineSchema` checks it). The formats and layouts it names are accepted as `format` and `layout`, at run time and in the types, for that call only. Its attributes type `attributes`, and the adapter passes it to `sanitize`. The `customFormats` and `customLayouts` options are removed: `toBlob(dot, { customFormats: ['mp4'], format: 'mp4' })` becomes `toBlob(dot, { schema: defineSchema({ types: { format: values.extend('mp4') } }), format: 'mp4' })`. `Options<T, S>` and `CommonOptions<S>` take the schema in place of the lists' names, and `SchemaFormat<S>` / `SchemaLayout<S>` give the names a schema adds.
- `sanitize` takes `schema`:
  - The strict policy also allows the attributes the schema adds. It never allows one that reads files (`image`, `shapefile`, …), whatever the schema says.
  - Both policies accept the style names of its `types.style` (`values.extend('sketchy')`; names of letters only) as known styles.
