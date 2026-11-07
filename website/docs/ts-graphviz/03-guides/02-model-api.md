---
description: Build, read and convert graphs as data with the model API.
---
# Using the Model API

The models are the data a graph is made of: `Digraph` / `Graph`, `Subgraph`, `Node`, `Edge` and the default attribute lists. Where the [DOT DSL](./01-dot-dsl.md) is for writing graphs as in DOT, the model API is for programs that build graphs from other data, read them, convert them, or define classes of their own.

Every DSL stands for a model: `modelOf(dsl)` gives it, and `dsl(model)` gives the DSL of a model. Both APIs work on the same graph.

## Building a graph

A graph creates its contents with `createNode`, `createEdge` and `createSubgraph`, using the classes of its models context:

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
| `nodes`, `edges`, `subgraphs` | the graph's nodes, edges and subgraphs; `nodes` holds the node statements, not the nodes that appear only in edges (see [the FAQ](./01-dot-dsl.md#a-node-that-only-appears-in-an-edge-is-not-in-nodes)) |
| `statements` | its nodes, edges and subgraphs in the order they were added, which `toDot` writes in that order; the graph's own attributes and its defaults are written before them (the default classes merge every default attribute statement into those defaults; `orderedModels` keeps them in their place) |
| `getNode(id)`, `getSubgraph(id)` | a node or subgraph by id |
| `existNode(id)`, `existEdge(edge)`, `existSubgraph(subgraph)` | whether the graph has it |
| `removeNode(nodeOrId)`, `removeEdge(edge)`, `removeSubgraph(subgraph)` | take it out |
| `get(key)`, `set(key, value)`, `apply(attributes)`, `delete(key)` | the graph's own attributes |
| `attributes.node`, `attributes.edge`, `attributes.graph` | the default attribute lists (`node [...]` and so on) |
| `addAttributeList(kind, attributes)` | a default attribute statement |

A node's and an edge's attributes are under `attributes`:

```typescript
import { fromDot } from 'ts-graphviz';

const g = fromDot('digraph { a [label = "A"]; a -> b; }');
const a = g.getNode('a');
a?.attributes.set('color', 'red');
console.log(a?.attributes.get('label')); // 'A'
console.log(g.statements.map((s) => s.$$type)); // ['Node', 'Edge']
g.removeNode('a');
```

`removeNode` takes out the node statement only: an edge to it stays, and Graphviz creates the node again when it renders the edge. Remove the edges too where the node should go:

```typescript
import { fromDot } from 'ts-graphviz';

const g = fromDot('digraph { a; a -> b; }');
for (const edge of g.edges) {
  if (edge.targets.some((t) => 'id' in t && t.id === 'a')) g.removeEdge(edge);
}
g.removeNode('a');
```

## The model guards

`isNodeModel`, `isEdgeModel`, `isSubgraphModel`, `isRootGraphModel`, `isAttributeListModel` and `isDotModel` tell what a value is. They are false for a DSL, which is not a model; check `modelOf(x)`, or `$$type`:

```typescript
import { digraph, isNodeModel, modelOf } from 'ts-graphviz';

const G = digraph((g) => {
  g.node('a');
});

const nodes = modelOf(G).statements.filter(isNodeModel);
console.log(nodes.length); // 1
```

## Models contexts

A models context is the set of classes a graph creates its contents with. `withContext(models)` gives factories (`digraph`, `graph`, `strict`) of a context; `graph.with(models)` sets the context of a graph; `fromDot` and `fromDotAll` take one as `convert.models`. A class left out keeps the default.

```typescript
import { Node, withContext } from 'ts-graphviz';

class MyNode extends Node {}

const { digraph } = withContext({ Node: MyNode });
digraph((g) => {
  g.node('a'); // the DSL of a MyNode
});
```

`orderedModels` is a models context whose graphs keep each default attribute statement in its place, as in DOT; `ts-graphviz/ordered` uses it for every factory (see [DOT's statement order](./01-dot-dsl.md#dots-statement-order)). A graph class you give replaces the ordered one: to keep the order with a class of your own, extend `OrderedDigraph`, `OrderedGraph` or `OrderedSubgraph`.

Custom classes, typed contexts and type extensions are covered in [Extending ts-graphviz](./05-extending-ts-graphviz.md).
