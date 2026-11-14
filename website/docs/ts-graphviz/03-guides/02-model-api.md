---
description: Build, read and convert graphs as data with the DOT Object Model (DOM).
---
# DOT Object Model (DOM)

The names follow the DOM of web browsers, but there are no events, selectors or live collections.

The **DOT Object Model (DOM)** is the set of objects a graph is made of: `Digraph` / `Graph`, `Subgraph`, `Node`, `Edge`, the default attribute statements and the comments. Where the [DOT DSL](./01-dot-dsl.md) is for writing graphs as in DOT, the DOM is for programs that build graphs from other data, read them, convert them, or define classes of their own.

Every DSL stands for a model of the DOM: `modelOf(dsl)` gives it, and `dsl(model)` gives the DSL of a model. Both work on the same graph. The DSL keeps DOT's words only (attributes, statements, `port`, `addComment`); everything on this page is on the model. Comments have no DSL: `dsl()` refuses them, and `addComment` gives the `CommentModel` itself.

## Building a graph

A graph creates its contents with `createNode`, `createEdge` and `createSubgraph`, using its model classes (see [Model kits](#model-kits)):

```typescript
import { Digraph, toDot } from 'ts-graphviz';

const g = new Digraph('G', { rankdir: 'LR' });
const a = g.createNode('a', { label: 'Start' });
const b = g.createNode('b');
g.createEdge([a, b], { color: 'red' });
const s = g.createSubgraph('cluster_0', { label: 'Group' });
s.createNode('c');

console.log(toDot(g));
// digraph "G" {
//   rankdir = "LR";
//   "a" [
//     label = "Start";
//   ];
//   "b";
//   "a" -> "b" [
//     color = "red";
//   ];
//   subgraph "cluster_0" {
//     label = "Group";
//     "c";
//   }
// }
```

Models created on their own are added with `addNode`, `addEdge` and `addSubgraph`:

```typescript
import { Digraph, Edge, Node } from 'ts-graphviz';

const g = new Digraph();
const a = new Node('a');
const b = new Node('b');
g.addNode(a);
g.addNode(b);
g.addEdge(new Edge([a, b]));
```

## Reading and changing a graph

| Member | |
| --- | --- |
| `id` | the name of a root graph, subgraph or node (its ID in DOT) |
| `nodes`, `edges`, `subgraphs` | the graph's nodes, edges and subgraphs; `nodes` holds the node statements, not the nodes that appear only in edges (see [the FAQ](./01-dot-dsl.md#a-node-that-only-appears-in-an-edge-is-not-in-nodes)) |
| `statements` | the graph's nodes, edges, subgraphs and default attribute statements after the leading ones, in the order they were added, which `toDot` writes in that order; the graph's own attributes and the leading defaults are written before them |
| `getNode(id)`, `getSubgraph(id)` | a node or subgraph by id |
| `existNode(id)`, `existEdge(edge)`, `existSubgraph(subgraph)` | whether the graph has it |
| `removeNode(nodeOrId)`, `removeEdge(edge)`, `removeSubgraph(subgraph)` | take it out |
| `addAttributeList(kind, attributes)` | add a default attribute statement (`node [...]` and so on) where the graph is, and return it |

`removeNode` takes out the node statement of this graph only: an edge to the node stays, as does a statement of it in a subgraph, and Graphviz creates the node again when it renders them. Where the node should go, remove those too, in every subgraph and with the members of edge groups (`b -> { a c }`):

```typescript
import { fromDot, type GraphBaseModel } from 'ts-graphviz';

function removeNodeEverywhere(g: GraphBaseModel, id: string): void {
  for (const edge of g.edges) {
    // a target or a member of a group
    if (edge.targets.flat().some((t) => t.id === id)) g.removeEdge(edge);
  }
  g.removeNode(id);
  // a subgraph holds statements of its own
  for (const s of g.subgraphs) removeNodeEverywhere(s, id);
}

const g = fromDot('digraph { a; subgraph cluster_s { a -> b; } }');
removeNodeEverywhere(g, 'a');
```

An edge statement is one chain: removing `a -> b -> c` or `b -> { a c }` also removes `b -> c`. Add back the links that should stay.

## Attributes

Graphs, subgraphs, nodes, edges and default attribute statements hold their attributes themselves, with the methods of the DOM's `Element`:

| Method | |
| --- | --- |
| `getAttribute(name)` | the value, or `undefined` |
| `setAttribute(name, value)` | set one |
| `removeAttribute(name)` | remove one |
| `hasAttribute(name)` | whether it is set |
| `getAttributeNames()` | the names that are set, in order |
| `setAttributes(attributes)` | set several, from an object or entries |
| `removeAttributes()` | remove all |

```typescript
import { fromDot } from 'ts-graphviz';

const g = fromDot('digraph { a [label = "A"]; a -> b; }');
const a = g.getNode('a');
a?.setAttribute('color', 'red');
console.log(a?.getAttribute('label')); // 'A'
console.log(a?.getAttributeNames()); // ['label', 'color']
console.log(g.statements.map((s) => s.$$type)); // ['Node', 'Edge']
```

The 3.x names (`get`, `set`, `delete`, `apply`, `clear`, `values`, `size`, and a node's or edge's `attributes`) keep working, deprecated until v5.

## Default attribute statements

As in DOT, a default attribute statement applies only to what follows it (the deprecated `legacyModels` classes merge every one into the leading defaults instead; see [Model kits](#model-kits)). `addAttributeList` adds one and returns its list, which you can keep to change those defaults later:

```typescript
import { Digraph, toDot } from 'ts-graphviz';

const g = new Digraph();
g.createNode('a');
const defaults = g.addAttributeList('Node', { shape: 'box' }); // applies to what follows
g.createNode('b');
defaults.setAttribute('color', 'red');

console.log(toDot(g));
// digraph {
//   "a";
//   node [
//     shape = "box";
//     color = "red";
//   ];
//   "b";
// }
```

A statement added before any other joins the leading defaults. `attributes` (`attributes.node` and so on) is deprecated: it is the leading defaults only.

## Comments

Every model but a comment takes comments: `addComment(text, { position, kind })` adds one and returns it, `comments` lists them, and `removeComment(comment)` takes one out. A comment is a frozen `CommentModel` with its `text`, `kind` (`'Slash'`, `'Block'` or `'Macro'`, or `undefined` for `fromModel`'s `commentKind` option) and `position` (`'leading'`, `'trailing'`, or on a graph or subgraph `'end'`).

```typescript
import { Digraph, toDot } from 'ts-graphviz';

const g = new Digraph('G');
const a = g.createNode('a');
a.addComment('hello');
console.log(a.comments.map((c) => [c.text, c.position])); // [['hello', 'leading']]

console.log(toDot(g));
// digraph "G" {
//   // hello
//   "a";
// }
```

`fromDot` keeps the comments between statements, with their kind and place, and `toDot` writes them back there. Two exceptions: a comment inside a statement (`a -> /* note */ b;`, `a [ /* note */ label = x ]`) is not kept, and a graph attribute assignment (`color = blue;`) is written before the statements, so a comment next to one leads the next statement instead. `comment` on a model is deprecated: it reads and sets the first leading comment.

## The model guards

`isNodeModel`, `isEdgeModel`, `isSubgraphModel`, `isRootGraphModel`, `isAttributeListModel`, `isDotModel` and `isCommentModel` tell what a value is. They are false for a DSL, which is not a model; check `modelOf(x)`, or `$$type`:

```typescript
import { digraph, isNodeModel, modelOf } from 'ts-graphviz';

const G = digraph((g) => {
  g.node('a');
});

const nodes = modelOf(G).statements.filter(isNodeModel);
console.log(nodes.length); // 1
```

## Model kits

A model kit is a set of model classes that fit together, and the operations that create models from them. `createModelKit(classes)` makes one, and `defaultModelKit` is the kit of the default classes. `withModelKit(classes)` gives factories (`digraph`, `graph`, `strict.digraph`, `strict.graph`) that create with a kit; `graph.with(classes)` sets the classes of a graph; `fromDot` and `fromDotAll` take the classes as `convert.models`. A class left out is the default one for `createModelKit`, `withModelKit` and `fromDot`, and the graph's current one for `graph.with`.

```typescript
import { Node, withModelKit } from 'ts-graphviz';

class MyNode extends Node {}

const { digraph } = withModelKit({ Node: MyNode });
digraph((g) => {
  g.node('a'); // the DSL of a MyNode
});
```

A kit's `createDigraph`, `createGraph`, `createSubgraph`, `createNode` and `createEdge` only create: what they return is in no graph until you add it.

```typescript
import { createModelKit, Node } from 'ts-graphviz';

class MyNode extends Node {}

const kit = createModelKit({ Node: MyNode });
const G = kit.createDigraph('G');
const a = kit.createNode('a'); // a MyNode, in no graph yet
const b = kit.createNode('b');
G.addNode(a);
G.addNode(b);
G.addEdge(kit.createEdge([a, b])); // adds the edge only
```

The DOT DSL creates with a kit too: the factories create with theirs, and `dsl(model, kit)` gives the DSL of a model that creates with `kit` (`dsl(model)` uses the default kit).

`legacyModels` (`LegacyGraph`, `LegacyDigraph`, `LegacySubgraph`) are the 3.x classes, which merge every default attribute statement into one set of defaults per graph; `ts-graphviz/legacy` uses them for every factory (see [DOT's statement order](./01-dot-dsl.md#dots-statement-order)). They are deprecated and removed in v5.

Custom classes, typed kits and type extensions are covered in [Extending ts-graphviz](./05-extending-ts-graphviz.md).
