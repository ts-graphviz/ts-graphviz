# @ts-graphviz/core

## 2.0.0

> It is part of the ts-graphviz library, which is split into modular packages to improve maintainability, flexibility, and ease of use.

This package contains the core implementation of models and functions provided to users for the ts-graphviz library.

## Features

- Graph, Node, and Edge model implementations
- High-level APIs for creating and manipulating DOT language elements
- Extensible design for custom implementations

## Usage

Import the necessary classes and functions from the @ts-graphviz/core package:

```ts
import { Graph, Node, Edge } from '@ts-graphviz/core';
```

Use the imported items in your project to create and manipulate DOT language elements:

```ts
const graph = new Graph('G');
const nodeA = new Node('A', { label: 'Node A' });
const nodeB = new Node('B', { label: 'Node B' });
const edge = new Edge([nodeA, nodeB], { label: 'A -> B' });

graph.addNode(nodeA);
graph.addNode(nodeB);
graph.addEdge(edge);

console.log(graph.toDot());
```
