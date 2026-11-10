---
"ts-graphviz": minor
---

`fromDot` and `fromDotAll` take `dsl: true` to return the DOT DSL of what they read, in place of the model.

```ts
const G = fromDot('digraph { a }', { dsl: true });
G.node('a').label = 'A';

const [A, B] = fromDotAll(src, { dsl: true });
```

The default stays the model. The result is typed by the option and the classes given (`convert.models`): `DSL<MyNode>` for `{ dsl: true, parse: { as: 'Node' }, convert: { models: { Node: MyNode } } }`. `FromDotOptions` takes the type of `dsl` as its third type parameter (`false` by default), and `FromDotResult<T, D>` gives what a reader returns for a model `T`. `ts-graphviz/legacy` takes the option too.
