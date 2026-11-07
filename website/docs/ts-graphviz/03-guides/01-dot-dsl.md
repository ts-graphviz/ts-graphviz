---
description: Write graphs with the DOT DSL, statement by statement, as in DOT.
---
# Writing Graphs with the DOT DSL

The factories `digraph()`, `graph()` and `strict.*` give the graph's **DOT DSL**. It reads like DOT: the DOT statements are its methods, and attributes are its properties. If you know how to write a graph in DOT, you know how to write it with the DSL.

```typescript
import { digraph, toDot } from 'ts-graphviz';

const G = digraph('G', (g) => {
  g.rankdir = 'LR';
  g.node({ shape: 'box' });
  const a = g.node('a', { label: 'Start' });
  g.edge([a, 'b', 'c']);
});

console.log(toDot(G));
// digraph "G" {
//   rankdir = "LR";
//   node [
//     shape = "box";
//   ];
//   "a" [
//     label = "Start";
//   ];
//   "a" -> "b" -> "c";
// }
```

For programs that build, read or convert graphs as data, see [Using the Model API](./02-model-api.md).

## From DOT to the DSL

| DOT | DSL |
| --- | --- |
| `digraph G { ... }` | `digraph('G', (g) => { ... })` |
| `strict graph { ... }` | `strict.graph((g) => { ... })` |
| `rankdir = LR;` | `g.rankdir = 'LR';` |
| `a [label = "A"];` | `g.node('a', { label: 'A' });` |
| `a -> b -> c;` | `g.edge(['a', 'b', 'c']);` |
| `c -> {d e};` | `g.edge(['c', ['d', 'e']]);` |
| `a:p1:n -> a:p2:s;` | `g.edge(['a:p1:n', a.$port({ port: 'p2', compass: 's' })]);` |
| `node [shape = box];` | `g.node({ shape: 'box' });` |
| `edge [color = gray];` | `g.edge({ color: 'gray' });` |
| `graph [fontname = Helvetica];` | `g.graph({ fontname: 'Helvetica' });` |
| `subgraph cluster_0 { label = Group; d; e; }` | `g.subgraph('cluster_0', { label: 'Group' }, (s) => { s.node('d'); s.node('e'); });` |
| `{ rank = same; b; c; }` | `g.subgraph({ rank: 'same' }, (s) => { s.node('b'); s.node('c'); });` |

Together:

```typescript
import { digraph, toDot } from 'ts-graphviz';

const G = digraph('G', (g) => {
  g.node({ shape: 'box' });
  const a = g.node('a', { label: 'Start' });
  g.node('b');
  g.edge([a, 'b', 'c']);
  g.edge(['c', ['d', 'e']]);
  g.edge(['a:p1:n', a.$port({ port: 'p2', compass: 's' })]);
  g.subgraph('cluster_0', { label: 'Group' }, (s) => {
    s.node('d');
    s.node('e');
  });
  g.subgraph({ rank: 'same' }, (s) => {
    s.node('b');
    s.node('c');
  });
});

console.log(toDot(G));
// digraph "G" {
//   node [
//     shape = "box";
//   ];
//   "a" [
//     label = "Start";
//   ];
//   "b";
//   "a" -> "b" -> "c";
//   "c" -> {"d" "e"};
//   "a":"p1":"n" -> "a":"p2":"s";
//   subgraph "cluster_0" {
//     label = "Group";
//     "d";
//     "e";
//   }
//   subgraph {
//     rank = "same";
//     "b";
//     "c";
//   }
// }
```

`g.node(id)` and `g.subgraph(id)` give the node or subgraph of that id if the graph has one, and create it otherwise, as DOT does when a name is written twice. A callback receives the DSL of the node, edge or subgraph; the method also returns it.

The attribute names are typed: your editor completes them and checks their values. A subgraph whose id starts with `cluster` takes the cluster attributes (`label`, `color`, …).

## Attributes are properties

Read, write and delete attributes under their own names:

```typescript
import { digraph } from 'ts-graphviz';

digraph((g) => {
  const a = g.node('a');
  a.label = 'A';
  a.color = 'red';
  delete a.label; // removes the attribute
  a.color = undefined; // so does assigning undefined
  console.log(a.label); // undefined
});
```

Attributes can also be written with the `attribute` constants (`a[attribute.label]`), and attributes you add by extending the types (see [Extending ts-graphviz](./05-extending-ts-graphviz.md)) the same way.

## The `$` rule

Attributes take the plain names, so the model's own members take a `$` in front:

| On the DSL | Meaning |
| --- | --- |
| `a.$id` | the node's name, its id in DOT |
| `a.id` | the Graphviz `id` attribute (the id of the SVG element) |
| `a.$comment`, `g.$nodes`, `g.$edges`, `g.$subgraphs` | the model's members |
| `g.$getNode('a')`, `g.$createNode('a')`, `a.$port('p')` | the model's methods |
| `a.$$type` | members whose names start with `$$` keep them |

```typescript
import { digraph } from 'ts-graphviz';

digraph((g) => {
  const a = g.node('a');
  a.id = 'svg-a';
  console.log(a.$id); // 'a'
  console.log(a.id); // 'svg-a'
  console.log(a.$$type); // 'Node'
});
```

The members of your own classes follow the same rule: a method `hello()` is `$hello()`, and a member named `$foo` is `$$foo`.

```typescript
import { Digraph, dsl } from 'ts-graphviz';

class MyDigraph extends Digraph {
  hello() {
    return `${this.nodes.length} nodes`;
  }
}

const g = dsl(new MyDigraph());
g.node('a');
console.log(g.$hello()); // '1 nodes'
```

## Editing a parsed graph

`fromDot` gives a model. `dsl()` gives the DSL of a model, so a parsed graph is edited the same way:

```typescript
import { dsl, fromDot, toDot } from 'ts-graphviz';

const g = dsl(fromDot('digraph { a [label = "A"]; a -> b; }'));
g.node('a').color = 'red';
g.edge(['b', 'c']);

console.log(toDot(g));
```

Every model you reach through a DSL is a DSL, and a model has one DSL, so DSLs compare with `===`. `modelOf(x)` gives the model back. `toDot`, `fromModel` and the adapter's `toBlob` take a DSL as well as a model.

## DOT's statement order

In DOT, a default attribute statement applies only to what follows it. The default models keep one set of defaults per graph, written first, so the last value applies to every node that does not set the attribute itself (an attribute set on a node, such as `g.node('a', { color: 'green' })`, always wins over a default). To write graphs with DOT's meaning, import from `ts-graphviz/ordered`: it has the same names as `ts-graphviz`, with models that keep each default attribute statement in its place.

```typescript
import { digraph, toDot } from 'ts-graphviz/ordered';

const G = digraph((g) => {
  g.node({ color: 'red' });
  g.node('a'); // red
  g.node({ color: 'blue' });
  g.node('b'); // blue
});

console.log(toDot(G));
// digraph {
//   node [
//     color = "red";
//   ];
//   "a";
//   node [
//     color = "blue";
//   ];
//   "b";
// }
```

`fromDot` from `ts-graphviz/ordered` reads DOT into the same models, so the default attribute statements of a source keep their places through `toDot(fromDot(source))`. (A graph's own attributes are still written first, so an attribute assigned after a subgraph, which the subgraph does not inherit in DOT, moves before it.) The explicit form, with `ts-graphviz` itself, is `withContext(orderedModels)` and `fromDot(source, { convert: { models: orderedModels } })`:

```typescript
import { fromDot, orderedModels, withContext } from 'ts-graphviz';

const { digraph } = withContext(orderedModels);
const G = digraph((g) => {
  g.node('a');
  g.edge({ color: 'red' }); // applies to the edges that follow
  g.edge(['a', 'b']);
});

const parsed = fromDot('digraph { node [color=red]; a; node [color=blue]; b; }', {
  convert: { models: orderedModels },
});
```

## FAQ

### A node that only appears in an edge is not in `$nodes`

```typescript
import { dsl, fromDot } from 'ts-graphviz';

const g = dsl(fromDot('digraph { a; a -> b; }'));
console.log(g.$nodes.map((n) => n.$id)); // ['a']
console.log(g.$getNode('b')); // undefined
```

In DOT, an edge creates the nodes it names. The models, though, record an edge's targets by id only: `$nodes` (and `nodes` of the model) holds the nodes written as node statements, not every node the graph has in Graphviz's sense. A node may belong to several subgraphs, and `a -> b` inside a subgraph may refer to a node written outside it, so the models do not guess. Declare a node with `g.node('b')` to have it in `$nodes`, or read the ids of an edge's targets.

### `isNodeModel(dsl)` is false

A DSL stands for a model but is not one, so the model guards (`isNodeModel`, `isRootGraphModel`, …) are false for it. Check `$$type`, or the model:

```typescript
import { digraph, isNodeModel, modelOf } from 'ts-graphviz';

digraph((g) => {
  const a = g.node('a');
  console.log(isNodeModel(a)); // false
  console.log(isNodeModel(modelOf(a))); // true
  console.log(a.$$type === 'Node'); // true
});
```

### With ordered models, `$attributes.node` holds the first defaults only

With `ts-graphviz/ordered`, a default attribute statement written after other statements is a statement of its own in the graph. `g.$attributes.node` is the defaults at the top of the graph, not the latest `node [...]`:

```typescript
import { digraph } from 'ts-graphviz/ordered';

digraph((g) => {
  g.node({ color: 'red' });
  g.node('a');
  g.node({ color: 'blue' });
  console.log(g.$attributes.node.color); // 'red'
});
```

For the same reason, `undefined` in a later statement does not remove a value set by an earlier one.
