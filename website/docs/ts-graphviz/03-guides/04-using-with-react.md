---
description: Use @ts-graphviz/react for declarative graphs with React and JSX.
---
# Using `@ts-graphviz/react`

`@ts-graphviz/react` is a React renderer for graphs. You write a graph as JSX with the components `<Digraph>`, `<Graph>`, `<Subgraph>`, `<Node>` and `<Edge>`. The renderer builds the [models](./02-model-api.md) from the elements, and `renderToDot` gives the DOT.

It renders to models and DOT, not to the DOM. To show a graph on a page, render the DOT to an image (see [Rendering to an image](#rendering-to-an-image)).

## Installation

```bash npm2yarn
npm install @ts-graphviz/react react
```

React 19.3 or later is required. `react-dom` is not needed.

The examples below that import from `ts-graphviz` need that package too.

## A first graph

The Graphviz attributes are props. An edge takes its nodes in `targets`. `renderToDot` returns a promise of the DOT string.

```tsx
import { Digraph, Edge, Node, renderToDot } from '@ts-graphviz/react';

const Example = () => (
  <Digraph id="G" rankdir="LR">
    <Node id="a" label="Start" shape="box" />
    <Node id="b" />
    <Edge targets={['a', 'b']} label="next" />
  </Digraph>
);

const dot = await renderToDot(<Example />);
console.log(dot);
// digraph "G" {
//   rankdir = "LR";
//   "a" [
//     label = "Start";
//     shape = "box";
//   ];
//   "b";
//   "a" -> "b" [
//     label = "next";
//   ];
// }
```

The element given to `renderToDot` must render exactly one `<Digraph>` or `<Graph>`. `<Subgraph>`, `<Node>` and `<Edge>` go inside a graph.

A graph is made of components, so you can write your own and reuse them:

```tsx
import { Digraph, Edge, Node, Subgraph, renderToDot } from '@ts-graphviz/react';

const Service = ({ id, name }: { id: string; name: string }) => (
  <Node id={id} label={name} shape="box" />
);

const dot = await renderToDot(
  <Digraph>
    <Subgraph id="cluster_backend" label="Backend">
      <Service id="api" name="API" />
      <Service id="db" name="Database" />
    </Subgraph>
    <Edge targets={['api', 'db']} />
  </Digraph>,
);
console.log(dot);
// digraph {
//   subgraph "cluster_backend" {
//     label = "Backend";
//     "api" [
//       label = "API";
//       shape = "box";
//     ];
//     "db" [
//       label = "Database";
//       shape = "box";
//     ];
//   }
//   "api" -> "db";
// }
```

## HTML-like labels

A `label` takes a string or an element. An element is written as an HTML-like label, with the `dot:` elements: `<dot:table>`, `<dot:tr>`, `<dot:td>`, `<dot:font>`, `<dot:b>`, `<dot:i>`, `<dot:u>`, `<dot:br>` and the other elements Graphviz has. Their types come with the package, and TypeScript needs no setup. If Babel compiles your JSX, set the `throwIfNamespace` option of its React preset to `false`.

```tsx
import { Digraph, Edge, Node, renderToDot } from '@ts-graphviz/react';

const dot = await renderToDot(
  <Digraph>
    <Node
      id="a"
      shape="plain"
      label={
        <dot:table border={0} cellborder={1} cellspacing={0}>
          <dot:tr>
            <dot:td port="in">in</dot:td>
            <dot:td>
              <dot:b>{'A & B'}</dot:b>
            </dot:td>
          </dot:tr>
        </dot:table>
      }
    />
    <Edge targets={['b', 'a:in']} label={<dot:i>to the port</dot:i>} />
  </Digraph>,
);
console.log(dot);
// digraph {
//   "a" [
//     shape = "plain";
//     label = <<table border="0" cellborder="1" cellspacing="0"><tr><td port="in">in</td><td><b>A &amp; B</b></td></tr></table>>;
//   ];
//   "b" -> "a":"in" [
//     label = <<i>to the port</i>>;
//   ];
// }
```

Strings are text: `&`, `<` and `>` in a child or an attribute value are written as entities, so a string cannot add markup. Write markup as elements. A port is the `port` attribute of `<dot:table>` or `<dot:td>`. An element that HTML-like labels do not have, such as `<div>`, throws a `TypeError`.

## Getting the models

The components add models to a graph. There are three ways to reach them.

`createRoot()` gives a root. `root.render(element)` returns a promise that resolves once the tree has settled. After that, `root.getTopLevelModels()` gives the rendered graph, and a `ref` gives the model of its element:

```tsx
import { createRef } from 'react';
import { Digraph, Edge, Node, createRoot } from '@ts-graphviz/react';
import { type GraphBaseModel, type NodeModel, toDot } from 'ts-graphviz';

const graphRef = createRef<GraphBaseModel>();
const nodeRef = createRef<NodeModel>();

const root = createRoot();
await root.render(
  <Digraph id="G" ref={graphRef}>
    <Node id="a" ref={nodeRef} />
    <Edge targets={['a', 'b']} />
  </Digraph>,
);

nodeRef.current?.setAttribute('color', 'red');
console.log(graphRef.current?.nodes.length); // 1

const [G] = root.getTopLevelModels();
console.log(G === graphRef.current); // true
console.log(toDot(G));
// digraph "G" {
//   "a" [
//     color = "red";
//   ];
//   "a" -> "b";
// }
```

`root.unmount()` removes what the root rendered. `renderToDot` unmounts its own root when it is done, so a `ref` is `null` after it returns: use `createRoot` when you need the models.

Inside a component, `useCurrentGraph()` gives the model of the enclosing `<Digraph>`, `<Graph>` or `<Subgraph>`:

```tsx
import {
  Digraph,
  Node,
  Subgraph,
  renderToDot,
  useCurrentGraph,
} from '@ts-graphviz/react';

const Member = ({ id }: { id: string }) => {
  const graph = useCurrentGraph();
  return <Node id={id} label={`${id} in ${graph.id}`} />;
};

const dot = await renderToDot(
  <Digraph id="G">
    <Member id="a" />
    <Subgraph id="cluster_x">
      <Member id="b" />
    </Subgraph>
  </Digraph>,
);
console.log(dot);
// digraph "G" {
//   "a" [
//     label = "a in G";
//   ];
//   subgraph "cluster_x" {
//     "b" [
//       label = "b in cluster_x";
//     ];
//   }
// }
```

The models are added when React commits, so read the contents of a graph after `render()` resolves, not while a component renders.

`createRoot` and `renderToDot` take a `models` option: the classes to create the models from, as in [Extending ts-graphviz](./05-extending-ts-graphviz.md).

## Rendering into an existing graph

With the `container` option, the elements are rendered into a graph you already have: a model or its [DOT DSL](./01-dot-dsl.md). The element then has no `<Digraph>` or `<Graph>` of its own. The statements the container already had stay first.

`<GraphPortal id="...">` sends its children to the graph of that id, after that graph's own statements. Without an `id`, or when no graph has it, they go to the root graph.

```tsx
import { Edge, GraphPortal, Node, renderToDot } from '@ts-graphviz/react';
import { digraph } from 'ts-graphviz';

const G = digraph('G', (g) => {
  g.node('a', { label: 'from the DSL' });
  g.subgraph('cluster_x', { label: 'X' }, (s) => {
    s.node('x1');
  });
});

const dot = await renderToDot(
  <>
    <Node id="b" />
    <Edge targets={['a', 'b']} />
    <GraphPortal id="cluster_x">
      <Node id="x2" />
    </GraphPortal>
  </>,
  { container: G },
);
console.log(dot);
// digraph "G" {
//   "a" [
//     label = "from the DSL";
//   ];
//   subgraph "cluster_x" {
//     label = "X";
//     "x1";
//     "x2";
//   }
//   "b";
//   "a" -> "b";
// }
```

`renderToDot` returns the DOT of the container and then unmounts, which takes the rendered statements out of the container again. To keep them in the graph, use `createRoot({ container })`: they stay until `root.unmount()`, and another `root.render()` replaces them.

```tsx
import { Node, createRoot, isNodeModel } from '@ts-graphviz/react';
import { digraph, toDot } from 'ts-graphviz';

const G = digraph('G', (g) => {
  g.node('a');
});

const root = createRoot({ container: G });
await root.render(<Node id="b" />);

console.log(root.getTopLevelModels(isNodeModel).map((n) => n.id)); // ['b']
console.log(toDot(G));
// digraph "G" {
//   "a";
//   "b";
// }

root.unmount();
console.log(toDot(G));
// digraph "G" {
//   "a";
// }
```

With a container, `getTopLevelModels()` gives every model the root rendered; a type guard such as `isNodeModel` filters them.

## Rendering to an image {#rendering-to-an-image}

Give the DOT to `toBlob` of `ts-graphviz/adapter`, which runs Graphviz (Node.js and Deno; see [Rendering Graphs to Images](./03-rendering-graphs-to-images.md)):

```tsx
import { writeFile } from 'node:fs/promises';
import { Digraph, Edge, Node, renderToDot } from '@ts-graphviz/react';
import { toBlob } from 'ts-graphviz/adapter';

const dot = await renderToDot(
  <Digraph>
    <Node id="a" label={<dot:b>A</dot:b>} />
    <Edge targets={['a', 'b']} />
  </Digraph>,
);

const blob = await toBlob(dot, { format: 'svg' });
console.log(blob.type); // 'image/svg+xml'
await writeFile('./result.svg', blob.stream());
```

`toBlob` checks the DOT with `sanitize` by default. A label with `<dot:img>`, or an `image` attribute, is rejected unless you pass `sanitize: false`; see [Sanitizing the DOT source](./03-rendering-graphs-to-images.md#sanitizing-the-dot-source).

## More

- The [package README](https://github.com/ts-graphviz/ts-graphviz/blob/main/packages/react/README.md) covers the rest: `renderHTMLLike`, the error callbacks of `createRoot`, the `signal` option for trees that suspend, and the full list of `dot:` elements.
- If your code uses the hooks `useDigraph`, `useGraph`, `useSubgraph`, `useNode` or `useEdge`, or calls `renderToDot` without `await`, see the [migration guide](../99-migration-guides/v3-to-v4/index.md).
