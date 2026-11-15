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

In addition to the DOT DSL, `ts-graphviz` offers an object-oriented API, providing model classes that represent graph elements. This approach leverages TypeScript's class-based features, allowing for more explicit and granular control.

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

<a id="understanding-apis-declarative-vs-imperative"></a>

## Two APIs: the DOT DSL and the DOM

`ts-graphviz` gives you two ways to work with a graph, both on the same graph:

- **The DOT DSL**, which the factories (`digraph`, `graph`, `strict.digraph`, `strict.graph`) give: the DOT statements are its methods and attributes are its properties, so a graph is written as in DOT. See [Writing Graphs with the DOT DSL](../03-guides/01-dot-dsl.md).
- **The DOT Object Model (DOM)**: the classes (`Digraph`, `Node`, `Edge`, …) and their methods, for programs that build, read or convert graphs as data, or define classes of their own. See [DOT Object Model (DOM)](../03-guides/02-model-api.md).

```typescript
import { digraph, modelOf, Node, toDot } from 'ts-graphviz';

const G = digraph('G', (g) => {
  g.rankdir = 'LR'; // rankdir = "LR";
  const a = g.node('A', { label: 'Start' }); // "A" [label = "Start";];
  g.edge([a, 'B']); // "A" -> "B";
});

toDot(G); // the DSL or its model
modelOf(G).addNode(new Node('C')); // the model behind the DSL
```
