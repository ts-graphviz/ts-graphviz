---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
"ts-graphviz": major
---

`defineSchema`, `attr` and `values`: attributes and value types of your own, for the models of one kit

A schema says which attributes, and which value types, the models of a kit take beyond (or instead of) the built-in ones. Only the models of that kit are typed with it: another library's graphs, or yours without the kit, are not changed.

```ts
import { attr, defineSchema, values, withModelKit } from 'ts-graphviz';

const schema = defineSchema({
  types: { style: values.extend<'sketchy'>() },   // every attribute of the style type
  graph: { hoge: attr<string>() },                 // a new attribute
  cluster: { team: attr<'core' | 'infra'>() },
  node: {
    'data-id': attr<number>(),
    shape: attr.extend<'my-shape'>(),              // the built-in type, or 'my-shape'
    label: attr.override<number>(),                // a number instead
  },
});

const { digraph } = withModelKit({ schema });
digraph((g) => {
  g.node('a', { 'data-id': 1, label: 2, style: 'sketchy' });
  g.node('b', { 'data-id': 'x' }); // type error: a number is expected
});
```

- `attr<T>()` adds an attribute; `attr.extend<T>()` and `attr.override<T>()` change a built-in one, and which of the two is always said: `attr<T>()` on a built-in attribute, or `attr.extend` / `attr.override` on another, is a type error. `values.extend<T>()` and `values.override<T>()` change a value type in `types` (`color`, `style`, `shape`, `arrowType`, `compass`, `rankdir`, …), and so every attribute that uses it. Every entry gives its type: a call without a type argument does not compile.
- The kinds are `graph`, `subgraph`, `cluster`, `node` and `edge`: a subgraph whose id starts with `cluster` (or with `cluster: true`) takes the `cluster` attributes, any other the `subgraph` ones.
- `defineSchema` gives a frozen copy of the schema, with entries of its own. A part it does not know, an entry that is not one `attr` or `values` makes (`{ mode }`, by shape, so one of another copy of the package counts), a getter in place of a value, a value type that is not one of `ValueTypes`, or `cluster` in `subgraph` or `cluster` throws a `TypeError` with code `TSG_ERR_INVALID_SCHEMA` (new).
- The schema goes with the classes: `createModelKit({ schema, Node: MyNode })`, `withModelKit({ schema })` and `fromDot(dot, { convert: { models: { schema } } })`. A class of the kit is one of the schema's models (`class MyNode extends Node<typeof schema> {}`); a class of another schema, or of none, is a type error. `ModelKitOptions` is the type of what they take and `ResolvedModelTypes<P>` the model types of the kit, of its schema; the `fromDot` / `fromDotAll` overloads for options whose classes are not known take classes without a schema (`NoSchemaClasses`).
- A kit has its schema: `kit.schema` (the empty schema `{}` without one, as for `defaultModelKit`). `ModelKit` implemented by hand needs it too.

The types are only types: the models of a schema hold and print any value as the others do, and `toDot` writes an attribute of a schema as any other.
