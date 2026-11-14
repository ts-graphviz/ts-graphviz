---
description: Write graphs with the DOT DSL, statement by statement, as in DOT.
---
# Writing Graphs with the DOT DSL

The factories `digraph()`, `graph()`, `strict.digraph()` and `strict.graph()` give the graph's **DOT DSL**. It reads like DOT: the DOT statements are its methods, and attributes are its properties. If you know how to write a graph in DOT, you know how to write it with the DSL.

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

The DSL stands for the graph's models, the [DOT Object Model (DOM)](./02-model-api.md), and holds only DOT's words: attributes, statements, ports and comments. Everything else a model does is on the model, which `modelOf(x)` gives (see [What is on the DSL, and what on the model](#what-is-on-the-dsl-and-what-on-the-model)).

## From DOT to the DSL

| DOT | DSL |
| --- | --- |
| `digraph G { ... }` | `digraph('G', (g) => { ... })` |
| `strict graph { ... }` | `strict.graph((g) => { ... })` |
| `rankdir = LR;` | `g.rankdir = 'LR';` |
| `a [label = "A"];` | `g.node('a', { label: 'A' });` |
| `a -> b -> c;` | `g.edge(['a', 'b', 'c']);` |
| `c -> {d e};` | `g.edge(['c', ['d', 'e']]);` |
| `a:p1:n -> a:p2:s;` | `g.edge(['a:p1:n', a.port({ port: 'p2', compass: 's' })]);` |
| `node [shape = box];` | `g.node({ shape: 'box' });` |
| `edge [color = gray];` | `g.edge({ color: 'gray' });` |
| `graph [fontname = Helvetica];` | `g.graph({ fontname: 'Helvetica' });` |
| `subgraph cluster_0 { label = Group; d; e; }` | `g.subgraph('cluster_0', { label: 'Group' }, (s) => { s.node('d'); s.node('e'); });` |
| `{ rank = same; b; c; }` | `g.subgraph({ rank: 'same' }, (s) => { s.node('b'); s.node('c'); });` |
| `// note` | `a.addComment('note');` |

Together:

```typescript
import { digraph, toDot } from 'ts-graphviz';

const G = digraph('G', (g) => {
  g.node({ shape: 'box' });
  const a = g.node('a', { label: 'Start' });
  g.node('b');
  g.edge([a, 'b', 'c']);
  g.edge(['c', ['d', 'e']]);
  g.edge(['a:p1:n', a.port({ port: 'p2', compass: 's' })]);
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

## Attributes

Attributes are properties under their own names. Assigning `undefined`, or `delete`, removes one:

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

The attribute methods (`getAttribute`, `setAttributes`, `getAttributeNames`, …) are on the model. They take any attribute name, such as one held in a variable:

```typescript
import { digraph, modelOf } from 'ts-graphviz';

digraph((g) => {
  const a = modelOf(g.node('a'));
  a.setAttributes({ label: 'A', color: 'red' });
  console.log(a.getAttribute('label')); // 'A'
  console.log(a.getAttributeNames()); // ['label', 'color']
  a.removeAttributes(); // all of them
});
```

## What is on the DSL, and what on the model {#what-is-on-the-dsl-and-what-on-the-model}

The DSL keeps DOT's words only, so none of its names is a Graphviz attribute, and your editor's completion lists the attributes and the few DSL members (an attribute of your own schema named like one, `port` say, is read and written on the model with `getAttribute` / `setAttribute`):

| On the DSL | Meaning |
| --- | --- |
| `a.label`, `a.id`, `a.comment`, `g.size`, … | the Graphviz attributes |
| `g.node(...)`, `g.edge(...)`, `g.subgraph(...)`, `g.graph(...)` | the DOT statements (on graphs and subgraphs) |
| `a.port('p')` | a node at a port, for an edge target |
| `a.addComment('note')` | a comment written into the DOT source |
| `a.$$type`, `list.$$kind` | the kind of model (`'Node'`, `'Edge'`, …) and of default attribute list |

Everything else is on the model, which `modelOf(x)` gives: the name of a node or graph (`id`), the graph's contents (`nodes`, `edges`, `subgraphs`, `statements`), its methods (`getNodes`, `addNode`, `removeNode`, …), the attribute methods, `comments`, an edge's `targets`, and the members of your own model classes.

```typescript
import { digraph, modelOf } from 'ts-graphviz';

digraph('G', (g) => {
  const a = g.node('a');
  a.id = 'svg-a'; // the Graphviz id attribute
  console.log(modelOf(a).id); // 'a': the node's name
  console.log(a.id); // 'svg-a'
  console.log(modelOf(g).id); // 'G'
  console.log(modelOf(g).nodes.length); // 1
  console.log(a.$$type); // 'Node'
});
```

The members of your own classes are on the model too:

```typescript
import { Edge, modelOf, withModelKit } from 'ts-graphviz';

class MyEdge extends Edge {
  cost() {
    return 1;
  }
}

const { digraph } = withModelKit({ Edge: MyEdge });
digraph((g) => {
  const e = g.edge(['a', 'b']);
  console.log(modelOf(e).cost()); // 1
});
```

A statement creates with the graph's model kit and adds what it created to the graph. The callbacks take that kit as their second argument, for creating a model without adding it:

```typescript
import { digraph, modelOf } from 'ts-graphviz';

digraph((g, kit) => {
  const a = kit.createNode('a'); // in no graph yet
  modelOf(g).addNode(a);
});
```

## Comments

`addComment` attaches a comment to a node, edge, subgraph, graph or default attribute statement. It is written before the statement by default; `position: 'trailing'` writes it after the statement, and on a graph or subgraph `position: 'end'` at the end of the body. `kind` is `'Slash'` (`//`), `'Block'` (`/* */`) or `'Macro'` (`#`).

```typescript
import { digraph, toDot } from 'ts-graphviz';

const G = digraph((g) => {
  const a = g.node('a');
  a.addComment('start');
  a.addComment('note', { position: 'trailing', kind: 'Block' });
  a.comment = 'kept by Graphviz'; // the Graphviz comment attribute
});

console.log(toDot(G));
// digraph {
//   // start
//   "a" [
//     comment = "kept by Graphviz";
//   ]; /* note */
// }
```

On the model, `comments` lists them and `removeComment(comment)` takes one out (`modelOf(a).comments`). On the DSL, `comment` is the Graphviz attribute, which Graphviz writes into its output; a comment of the DOT source is a `CommentModel`.

## Editing a parsed graph

`fromDot` gives a model; with `{ dsl: true }` it gives the DSL of that model, so a parsed graph is edited the same way. `fromDotAll` takes the option too.

```typescript
import { dsl, fromDot, modelOf, toDot } from 'ts-graphviz';

const g = fromDot('digraph { a [label = "A"]; a -> b; }', { dsl: true });
dsl(modelOf(g).getNodes('a')[0]).color = 'red';
g.edge(['b', 'c']);

console.log(toDot(g));
```

`g.node('a')` would declare `a` again, as a statement written again in DOT does (`a [color = "red"];` after the others); to change the node there is, take it from the model with `getNodes`.

What a statement gives is a DSL. A DSL is a model together with the kit its statements create with, and a model and a kit have one DSL, so DSLs compare with `===`. `modelOf(x)` gives the model back. `dsl(model)` gives the DSL of any model you read from it, creating with the default kit; `dsl(model, kit)` gives the one that creates with `kit`. With `{ dsl: true }`, the kit is the one of `convert.models`. `toDot`, `fromModel` and the adapter's `toBlob` take a DSL as well as a model.

## DOT's statement order

As in DOT, a default attribute statement applies only to what follows it. `g.node({ ... })`, `g.edge({ ... })` and `g.graph({ ... })` add one where they are called and return its DSL, which you can keep to change those defaults later:

```typescript
import { digraph, toDot } from 'ts-graphviz';

const G = digraph((g) => {
  g.node('a');
  const defaults = g.node({ shape: 'box' }); // applies to what follows
  g.node('b');
  defaults.color = 'red';
});

console.log(toDot(G));
// digraph {
//   "a";
//   node [
//     shape = "box";
//     color = "red";
//   ];
//   "b";
// }
```

`fromDot` keeps each default attribute statement of a source where it is, so `node [color=red]; a; node [color=blue]; b` renders `a` red and `b` blue, as Graphviz does. A node's own attribute (`g.node('a', { color: 'green' })`) always wins over a default.

3.x merged every default attribute statement into one set of defaults per graph, written first, so a default given after other statements applied to what came before it too. To keep that output while you move to v4, import from `ts-graphviz/legacy`, which has the same names as `ts-graphviz`, with factories and `fromDot` that use the 3.x classes (`legacyModels`); it is deprecated and removed in v5. The classes exported under their own names (`Digraph`, `Graph`, `Subgraph`) are v4's there too: where you construct a graph yourself, use `LegacyDigraph`, `LegacyGraph` or `LegacySubgraph`.

```typescript
import { digraph, toDot } from 'ts-graphviz/legacy';

const G = digraph((g) => {
  g.node('a');
  g.node({ color: 'blue' }); // a is blue too, as in 3.x
});

console.log(toDot(G));
// digraph {
//   node [
//     color = "blue";
//   ];
//   "a";
// }
```

## FAQ

### A node that only appears in an edge is not in `nodes`

```typescript
import { fromDot } from 'ts-graphviz';

const g = fromDot('digraph { a; a -> b; }');
console.log(g.nodes.map((n) => n.id)); // ['a']
console.log(g.getNodes('b')); // []
```

In DOT, an edge creates the nodes it names. The models, though, record an edge's targets by id only: `nodes` holds the nodes written as node statements, not every node the graph has in Graphviz's sense. A node may belong to several subgraphs, and `a -> b` inside a subgraph may refer to a node written outside it, so the models do not guess. Declare a node with `g.addNode(new Node('b'))` (`dsl(g).node('b')` on the DSL) to have it in `nodes`, or read the ids of an edge's targets.

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

### A default given after other statements changed my 3.x output

In v4 it applies only to what follows it, as in DOT. Give the defaults before the other statements to have them apply to the whole graph, or import from `ts-graphviz/legacy` to keep the 3.x output for now.

### Where did `attributes` go?

`modelOf(g).attributes.node` is deprecated: it is the defaults at the top of the graph only. Keep the DSL that `g.node({ ... })` returns, and change the defaults through it.
