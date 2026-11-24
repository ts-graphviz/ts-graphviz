---
"@ts-graphviz/react": minor
---

`createComponents(kit)`: the components typed with a kit's schema and classes

JSX cannot type a component from the root it is rendered in, so components typed with a schema come from `createComponents`. They are the components of the package, typed with the kit: their attributes are those of its schema, and their `ref` gives its models. Give the root the same classes and schema, as `createModelKit` takes them: `createRoot` and `fromElement` take `models: { schema, ... }` (`ModelKitOptions`).

```tsx
const schema = defineSchema({ node: { tier: attr<'core' | 'edge'>() } });
const { Digraph, Node } = createComponents(createModelKit({ schema }));
const dot = await fromElement(
  <Digraph>
    <Node id="a" tier="core" />
  </Digraph>,
  { models: { schema } },
);
```

The default components keep the default schema. The prop types take the kit's model types `M` (`NodeProps<M>`, `EdgeProps<M>`, `RootGraphProps<M>`, `SubgraphProps<Id, M>`, `RootGraphOptions<M>`, `SubgraphOptions<Id, M>`, `NodeOptions<M>`, `EdgeOptions<M>`, `GraphBaseAttributesProps<M>`), and `NodeProps`, `EdgeProps`, `RootGraphProps`, `RootGraphOptions`, `NodeOptions` and `EdgeOptions` are type aliases now: declaration merging no longer extends them (breaking). The `label` / `xlabel` props take a React element or a string, or the type the schema gives them where it changes them to one without strings. The `ref` of `Digraph`, `Graph` and `Subgraph` gives a graph typed with the schema or a model of the kit's class. A container of `createRoot` / `fromElement` is still typed as a graph without a schema.
