---
description: Explore core APIs for graph creation and manipulation.
---


# Core Features

## TypeScript-Friendly API

`ts-graphviz` provides an API that integrates seamlessly with TypeScript, offering strong type definitions and full IntelliSense support. This makes it easier to catch errors during development and enhances the developer experience.

**Playground:**

```ts ts-graphviz:read-only
import { digraph, attribute as _ } from 'ts-graphviz';

const G = digraph('G', (g) => {
  g.node('A', { [_.color]: 'red' });
  g.edge(['A', 'B'], { [_.label]: 'A to B' });
});
```

:::tip
Hover over `digraph` or `g.node` or `[_.color]` for type hints.
:::

**Explanation:**

- **Strong Typing**: TypeScript's type system helps prevent errors by ensuring that the correct types are used.
- **IntelliSense Support**: Code editors like Visual Studio Code can provide autocompletion and documentation hints.

### Object-Oriented Models

In addition to the declarative style, `ts-graphviz` offers an object-oriented API, providing model classes that represent graph elements. This approach leverages TypeScript's class-based features, allowing for more explicit and granular control.

**Model Classes:**

- `Graph` / `Digraph`: Represents the entire graph.
- `Subgraph`: Represents a subgraph or cluster.
- `Node`: Represents a node in the graph.
- `Edge`: Represents an edge between nodes.

**Example:**

```typescript
import { Digraph, Node, Edge, toDot } from 'ts-graphviz';

const G = new Digraph('G');

const nodeA = new Node('A');
const nodeB = new Node('B');

const edge = new Edge([nodeA, nodeB]);

G.addNode(nodeA);
G.addNode(nodeB);
G.addEdge(edge);

console.log(toDot(G));
```

**Explanation:**

- **Instantiating Classes**: Create instances of `Node`, `Edge`, and `Digraph` to build the graph.
- **Adding Elements to the Graph**: Use `addNode` and `addEdge` methods to add elements to the graph.
- **Explicit Control**: You have direct access to manipulate each element individually.

**Benefits of the Object-Oriented Approach:**

- **Explicit Control**: Offers fine-grained control over graph elements.
- **Extensibility**: Allows you to extend classes to create custom behaviors or attributes.
- **Alignment with TypeScript**: Utilizes TypeScript's object-oriented capabilities, making it intuitive for developers familiar with these concepts.

---

## Understanding APIs: Declarative vs. Imperative

As you become more comfortable with `ts-graphviz`, you'll encounter two primary styles for building graphs: **Declarative** and **Imperative** APIs.

### Declarative API

The declarative API provides a concise and readable way to define your graph. It uses methods like `node`, `edge`, and `subgraph` within a callback function to build the graph structure.

**Example:**

```typescript
import { digraph } from 'ts-graphviz';

const G = digraph('G', (g) => {
  g.node('A');
  g.node('B');
  g.edge(['A', 'B']);
});
```

**Explanation:**

- **Graph Factory Function**: The `digraph` function creates a new graph and provides a context `g`.
- **Adding Elements**: Use `g.node` and `g.edge` to add nodes and edges within the context.
- **Readability**: The structure mirrors the graph's logical structure, making it easier to read.

### Imperative API

The imperative API offers explicit control over the creation and manipulation of graph elements. It uses object-oriented methods to build the graph step by step.

**Example:**

```typescript
import { Digraph } from 'ts-graphviz';

const G = new Digraph('G');

const nodeA = G.createNode('A');
const nodeB = G.createNode('B');
G.createEdge([nodeA, nodeB]);
```

**Explanation:**

- **Instantiating the Graph**: Create a new `Digraph` instance.
- **Creating Nodes and Edges**: Use `createNode` and `createEdge` methods to explicitly add elements.
- **Explicit Control**: This style gives you more control over the creation process.

**Choosing the Right API**

- **Declarative API**: Ideal for quickly defining the structure of a graph with less code.
- **Imperative API**: Useful when you need explicit control over the creation and manipulation of graph elements.
