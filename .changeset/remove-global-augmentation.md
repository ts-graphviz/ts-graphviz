---
"@ts-graphviz/common": major
"@ts-graphviz/ast": major
"ts-graphviz": major
---

Global type augmentation is removed: attributes and value types of your own go in a schema

The `$` interfaces that `declare module '@ts-graphviz/common'` extended are removed: `Attribute.$keys`, `Attribute.$types`, `EdgeAttributeKey.$values` / `NodeAttributeKey.$values` / `GraphAttributeKey.$values` / `SubgraphAttributeKey.$values` / `ClusterSubgraphAttributeKey.$values`, the value enumerations' `$values` / `Style.$styleItem` / `Color.$colors` / `ArrowType.$shape` / `StartType.$style`, every `$exclude`, `$keywords` and `$keywordsValidation`. One augmentation changed the types of every graph in the program, including a library's, clashed when two libraries declared a key differently, and reached only one of two copies of the package.

- The attribute keys (`EdgeAttributeKey`, …), `Attribute.keys`, `Attribute.types`, `AttributeValueTypeNames`, `ValueTypes`, `AttributeValueTypes` and `SchemaKindAttributeKeys` are type aliases now, and the value enumerations (`Compass`, `RankType`, `DirType`, `ClusterMode`, …) plain unions: declaration merging cannot extend them.
- The `.values` aliases (`EdgeAttributeKey.values`, `Compass.values`, `RankType.values`, …) are removed: use the type itself. The members that name parts of a type stay: `ArrowType.build`, `ArrowType.shape` (and the other `ArrowType` members), `Style.styleItem`, `Color.ColorName`, `StartType.style`.
- `PackMode` no longer refers to the misspelt `PickMode` namespace, which is removed.
- `AttributeASTNode` and `AttributeASTProperties` of `@ts-graphviz/ast` take any string as their key by default (`T extends string = string`), as DOT does; an attribute of a schema is one.

A schema (`defineSchema` with `attr` and `values`) types the attributes and value types of the models of one kit:

```ts
const schema = defineSchema({ graph: { hoge: attr<string>() } });
const { digraph } = withModelKit({ schema });
digraph((g) => {
  g.hoge = 'fuga';
});
```

A `declare module '@ts-graphviz/common'` block left in your code that does not import `$keywords` still compiles, and adds nothing: search for it when you upgrade.
