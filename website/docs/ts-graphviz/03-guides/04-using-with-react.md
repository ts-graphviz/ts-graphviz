---
description: Use @ts-graphviz/react for declarative graphs with React and JSX.
---
# Using `@ts-graphviz/react`

`@ts-graphviz/react` allows you to define your graphs using React's declarative UI paradigm.

By leveraging JSX, you can express the DOT language models in a more intuitive and component-based way, enhancing reusability and readability.

## Features

- **Declarative Graph Definition**: Use JSX to define graphs, nodes, and edges in a declarative manner.
- **HTML-like Labels with JSX**: Create complex and rich labels using JSX, which can be rendered as HTML-like labels in your graphs.
- **Component Reusability**: Build reusable graph components, making your codebase more maintainable.

## Installation

```bash npm2yarn
npm install @ts-graphviz/react react react-dom
```

## Example


```jsx
import React from 'react';
import { Digraph, Node, Edge, renderToDot } from '@ts-graphviz/react';

const MyDiagram = () => (
  <Digraph id="G">
    <Node id="A" label="Node A" />
    <Node
      id="B"
      label={
        <dot:table border={0} cellborder={1} cellspacing={0}>
          <dot:tr>
            <dot:td>left</dot:td>
            <dot:td port="m">middle</dot:td>
            <dot:td port="r">right</dot:td>
          </dot:tr>
        </dot:table>
      }
    />
    <Edge targets={['A', 'B']} label={<b>Edge from A to B</b>} />
  </Digraph>
);

const dot = renderToDot(<MyDiagram />);
console.log(dot);
```

### Explanation

- **JSX Syntax**: Use JSX to define nodes and edges, making the code more readable.
- **HTML-like Labels**: Leverage JSX to create rich labels for nodes and edges.
- **Component-Based Design**: Encapsulate graph logic within React components for reusability.

## When to Use `@ts-graphviz/react`

- When you prefer a declarative approach to define your graphs.
- If you're already familiar with React and want to leverage its paradigms.
- When you need to create complex labels using HTML-like syntax.
