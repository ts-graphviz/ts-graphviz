<div align="center">

[![Main](https://github.com/ts-graphviz/ts-graphviz/actions/workflows/main.yaml/badge.svg)](https://github.com/ts-graphviz/ts-graphviz/actions/workflows/main.yaml)
[![CodeQL](https://github.com/ts-graphviz/ts-graphviz/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/ts-graphviz/ts-graphviz/actions/workflows/codeql-analysis.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/ts-graphviz/ts-graphviz/blob/main/LICENSE)
[![All Contributors](https://img.shields.io/github/all-contributors/ts-graphviz/ts-graphviz?color=orange)](#contributors-)

[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/8396/badge)](https://www.bestpractices.dev/projects/8396)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/ts-graphviz/ts-graphviz/badge)](https://scorecard.dev/viewer/?uri=github.com/ts-graphviz/ts-graphviz)
[![Tidelift](https://tidelift.com/badges/package/npm/ts-graphviz?style=flat)](https://tidelift.com/subscription/pkg/npm-ts-graphviz?utm_source=npm-ts-graphviz&utm_medium=readme)

[![npm version](https://badge.fury.io/js/ts-graphviz.svg)](https://badge.fury.io/js/ts-graphviz)
![node version](https://img.shields.io/node/v/ts-graphviz)
[![deno version](https://img.shields.io/badge/deno-lts-black?logo=deno)](https://github.com/denoland/deno)
[![npm](https://img.shields.io/npm/dm/ts-graphviz)](https://npmtrends.com/ts-graphviz)

# @ts-graphviz/react

React Components and Renderer for ts-graphviz
🔗

[![GitHub](https://img.shields.io/badge/-GitHub-181717?logo=GitHub&style=flat)](https://github.com/ts-graphviz/ts-graphviz)
[![npm](https://img.shields.io/badge/-npm-CB3837?logo=npm&style=flat)](https://www.npmjs.com/package/ts-graphviz)
[![Reference](https://img.shields.io/badge/-API_Reference-3178C6?logo=TypeScript&style=flat&logoColor=fff)](https://ts-graphviz.github.io/ts-graphviz/)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/ts-graphviz/ts-graphviz)

[![Sponsor](https://img.shields.io/badge/-GitHub%20Sponsor-fff?logo=GitHub%20Sponsors&style=flat)](https://github.com/sponsors/ts-graphviz)
[![OpenCollective](https://img.shields.io/badge/-OpenCollective-7FADF2?logo=opencollective&style=flat&logoColor=white)](https://opencollective.com/ts-graphviz)

[![format: Biome](https://img.shields.io/badge/format%20with-Biome-F7B911?logo=biome&style=flat)](https://biomejs.dev/)
[![test: Vitest](https://img.shields.io/badge/tested%20with-Vitest-6E9F18?logo=vitest&style=flat)](https://vitest.dev/)
[![build: Vite](https://img.shields.io/badge/build%20with-Vite-646CFF?logo=vite&style=flat)](https://rollupjs.org/)

</div>

---

> It is part of the ts-graphviz library, which is split into modular packages to improve maintainability, flexibility, and ease of use.

## Installation

The module can then be installed using [npm](https://www.npmjs.com/):

[![NPM](https://nodei.co/npm/@ts-graphviz/react.png)](https://nodei.co/npm/@ts-graphviz/react/)

```bash
# yarn
$ yarn add @ts-graphviz/react react@^19
# or npm
$ npm install -S @ts-graphviz/react react@^19
# or pnpm
$ pnpm add @ts-graphviz/react react@^19
```

> **Important**: Install React 19+ as a peerDependency. React 18 and earlier versions are not supported. Note that `react-dom` is no longer required as this package now uses a custom HTML rendering implementation.

## Key Features

## React Component

### Core Components

The package provides React components that map directly to Graphviz DOT language constructs:

#### Graph Containers
- **`<Digraph>`** - Creates a directed graph (arrows point from source to target)
- **`<Graph>`** - Creates an undirected graph (no arrow direction)
- **`<Subgraph>`** - Creates a subgraph cluster for grouping related nodes

#### Graph Elements
- **`<Node>`** - Creates a node/vertex with customizable attributes
- **`<Edge>`** - Creates an edge/connection between nodes with optional styling

### Component Props & Attributes

All components accept Graphviz DOT attributes as props with full TypeScript support:

```tsx
// Node with styling attributes
<Node
  id="server1"
  label="Web Server"
  shape="box"
  color="blue"
  style="filled"
  fillcolor="lightblue"
/>

// Edge with custom styling
<Edge
  targets={["server1", "database1"]}
  label="API calls"
  color="red"
  style="dashed"
  weight={2}
/>

// Digraph with global attributes
<Digraph
  rankdir="LR"
  bgcolor="white"
  node={{ shape: "ellipse", color: "gray" }}
  edge={{ color: "black", arrowhead: "vee" }}
>
  {/* nodes and edges */}
</Digraph>
```

### Nested Structure & Composition

Components can be freely nested to create complex graph structures:

```tsx
// Define reusable components
const ServerNode = ({ id, name, type }) => (
  <Node
    id={id}
    label={
      <dot:table border="1" cellborder="0" cellspacing="0">
        <dot:tr>
          <dot:td bgcolor="lightgray">
            <dot:b>{name}</dot:b>
          </dot:td>
        </dot:tr>
        <dot:tr>
          <dot:td>{type}</dot:td>
        </dot:tr>
      </dot:table>
    }
    shape="record"
  />
);

const ServiceCluster = ({ id, label, children }) => (
  <Subgraph id={id} label={label} style="filled" fillcolor="lightblue">
    {children}
  </Subgraph>
);

// Compose the architecture
const SystemArchitecture = () => (
  <Digraph rankdir="TB">
    <ServiceCluster id="cluster_frontend" label="Frontend Layer">
      <ServerNode id="web1" name="Web Server" type="Nginx" />
      <ServerNode id="app1" name="App Server" type="React" />
    </ServiceCluster>

    <ServiceCluster id="cluster_backend" label="Backend Layer">
      <ServerNode id="api1" name="API Gateway" type="REST" />
      <ServerNode id="auth1" name="Auth Service" type="OAuth" />
    </ServiceCluster>

    <ServiceCluster id="cluster_data" label="Data Layer">
      <ServerNode id="db1" name="Database" type="PostgreSQL" />
      <ServerNode id="cache1" name="Cache" type="Redis" />
    </ServiceCluster>

    <Edge targets={["web1", "app1"]} label="serves" />
    <Edge targets={["app1", "api1"]} label="API calls" />
    <Edge targets={["api1", "auth1"]} label="validates" />
    <Edge targets={["api1", "db1"]} label="queries" />
    <Edge targets={["api1", "cache1"]} label="caches" />
  </Digraph>
);
```

### HTML-Like Labels with JSX

Create rich, formatted labels using Graphviz's HTML-like label syntax with natural JSX:

```tsx
// Reusable table component for data records
const DataRecord = ({ title, fields }) => (
  <dot:table border="1" cellborder="0" cellspacing="0">
    <dot:tr>
      <dot:td bgcolor="lightblue" colspan="2">
        <dot:b>{title}</dot:b>
      </dot:td>
    </dot:tr>
    {fields.map(([key, value]) => (
      <dot:tr key={key}>
        <dot:td port={key}>{key}</dot:td>
        <dot:td>{value}</dot:td>
      </dot:tr>
    ))}
  </dot:table>
);

// Status indicator component
const StatusIndicator = ({ status, message }) => (
  <>
    <dot:b>Status:</dot:b><dot:br/>
    <dot:font color={status === 'active' ? 'green' : 'red'}>
      <dot:b>{status.toUpperCase()}</dot:b>
    </dot:font><dot:br/>
    <dot:i>{message}</dot:i>
  </>
);

// Usage in graph
const DatabaseDiagram = () => (
  <Digraph>
    <Node
      id="user-table"
      label={<DataRecord
        title="Users"
        fields={[['id', '1001'], ['name', 'John Doe'], ['email', 'john@example.com']]}
      />}
      shape="record"
    />

    <Node
      id="server-status"
      label={<StatusIndicator status="active" message="All systems operational" />}
      shape="box"
      style="rounded,filled"
      fillcolor="lightyellow"
    />

    <Edge targets={["user-table", "server-status"]} label="monitors" />
  </Digraph>
);
```

### Available HTML-Like Elements

- `<dot:table>`, `<dot:tr>`, `<dot:td>` - Table structures
- `<dot:b>`, `<dot:i>`, `<dot:u>` - Text formatting (bold, italic, underline)
- `<dot:font>` - Font styling with color, face, point-size
- `<dot:br>` - Line breaks
- `<dot:hr>`, `<dot:vr>` - Horizontal/vertical rules
- `<dot:img>` - Images
- `<dot:s>`, `<dot:sub>`, `<dot:sup>`, `<dot:o>` - Advanced text formatting

### TypeScript Integration

Full type safety with IntelliSense support for all Graphviz attributes:

```tsx
import type { NodeProps, EdgeProps, DigraphProps } from '@ts-graphviz/react';

// Typed component props
const MyNode: React.FC<NodeProps> = (props) => (
  <Node
    shape="box"      // ✅ TypeScript knows valid shapes
    color="blue"     // ✅ String colors supported
    style="filled"   // ✅ Valid style options
    {...props}
  />
);

// Edge with typed targets
<Edge
  targets={["node1", "node2"]}  // ✅ Tuple type enforced
  arrowhead="diamond"           // ✅ Valid arrowhead styles
/>
```

#### Enhanced Type Safety

The package provides sophisticated TypeScript support with automatic type inference and runtime type filtering:

```tsx
// ✅ Automatic type inference - no casting needed
const root = createRoot();
await root.render(
  <Digraph id="myGraph" rankdir="LR">
    <Node id="A" shape="box" />
    <Node id="B" shape="circle" />
    <Edge targets={["A", "B"]} />
  </Digraph>
);

// ✅ Type-safe model access
const models = root.getTopLevelModels();
// models is automatically typed as DotObjectModel[]

// ✅ Runtime type filtering with built-in type guards
import { isNodeModel, isEdgeModel, isRootGraphModel } from '@ts-graphviz/common';

// Filter by model type with automatic type narrowing
const nodes = root.getTopLevelModels(isNodeModel);
nodes.forEach(node => console.log(node.id)); // TypeScript knows this is NodeModel

const edges = root.getTopLevelModels(isEdgeModel);
edges.forEach(edge => console.log(edge.targets)); // TypeScript knows this is EdgeModel

const graphs = root.getTopLevelModels(isRootGraphModel);
graphs.forEach(graph => console.log(graph.directed)); // TypeScript knows this is RootGraphModel

// ✅ Direct type casting (trusted user assertion)
// When you know the exact types, you can cast directly without runtime validation
const trustedNodes = root.getTopLevelModels<NodeModel>();
trustedNodes.forEach(node => console.log(node.id)); // TypeScript trusts your assertion

const trustedEdges = root.getTopLevelModels<EdgeModel>();
trustedEdges.forEach(edge => console.log(edge.targets)); // No runtime type checking

// ✅ Advanced model type checking
const allModels = root.getTopLevelModels();
for (const model of allModels) {
  if (isNodeModel(model)) {
    console.log(`Node: ${model.id}`);
  } else if (isEdgeModel(model)) {
    console.log(`Edge: ${model.targets.map(t => t.id).join(' -> ')}`);
  } else if (isRootGraphModel(model)) {
    console.log(`Graph: ${model.id} (directed: ${model.directed})`);
  }
}
```

#### Container Mode Type Safety

When using container mode, you get access to all rendered models with full type safety:

```tsx
import { digraph } from 'ts-graphviz';
import { isNodeModel, isEdgeModel, isSubgraphModel } from '@ts-graphviz/react';

const container = digraph('myContainer');
const root = createRoot({ container });

await root.render(
  <>
    <Node id="node1" />
    <Node id="node2" />
    <Edge targets={['node1', 'node2']} />
    <Subgraph id="cluster1">
      <Node id="node3" />
    </Subgraph>
  </>
);

// Container mode: access all non-container models with type safety

// Runtime type filtering (safe, validates at runtime)
const allNodes = root.getTopLevelModels(isNodeModel); // NodeModel[]
const allEdges = root.getTopLevelModels(isEdgeModel); // EdgeModel[]
const subgraphs = root.getTopLevelModels(isSubgraphModel); // SubgraphModel[]

// Direct type casting (user knows the types, no runtime validation)
const trustedNodes = root.getTopLevelModels<NodeModel>(); // All models cast as NodeModel[]
const trustedEdges = root.getTopLevelModels<EdgeModel>(); // All models cast as EdgeModel[]

// Type-safe operations
allNodes.forEach(node => {
  node.attributes.set('color', 'blue'); // TypeScript knows node attributes
});

allEdges.forEach(edge => {
  console.log(`Edge from ${edge.targets[0]} to ${edge.targets[1]}`);
});
```

## Core Functions
The package provides clean async rendering APIs:

- `createRoot()` - Creates a rendering root following React 19's createRoot pattern
- `renderToDot()` - Primary async function for converting React components to DOT language strings
- `renderHTMLLike()` - Renders HTML-like label structures for use in node or edge labels

All rendering functions are **async-only** and provide a clean, consistent API surface. The new `createRoot()` API follows React 19's modern patterns for better performance and error handling.

## Usage Examples

### Creating a Simple Graph

```tsx
import { Digraph, Node, Edge, createRoot, renderToDot } from "@ts-graphviz/react";

// Define a reusable process component
const ProcessNode = ({ id, label, color = "lightblue" }) => (
  <Node
    id={id}
    label={
      <dot:table border="0" cellborder="1" cellspacing="0">
        <dot:tr>
          <dot:td bgcolor={color}>
            <dot:b>{label}</dot:b>
          </dot:td>
        </dot:tr>
      </dot:table>
    }
    shape="record"
  />
);

// Create a workflow diagram
const WorkflowDiagram = () => (
  <Digraph rankdir="LR">
    <ProcessNode id="start" label="Start" color="lightgreen" />
    <ProcessNode id="process" label="Process Data" />
    <ProcessNode id="validate" label="Validate" />
    <ProcessNode id="end" label="End" color="lightcoral" />

    <Edge targets={["start", "process"]} />
    <Edge targets={["process", "validate"]} />
    <Edge targets={["validate", "end"]} />
  </Digraph>
);

// Create root and render to graph models
const root = createRoot();
await root.render(<WorkflowDiagram />);
const models = root.getTopLevelModels();

// Convert to DOT string
const dotString = await renderToDot(<WorkflowDiagram />);
```

### Using HTML-Like Labels

```tsx
import { Digraph, Node, Edge, renderToDot } from "@ts-graphviz/react";

// Reusable card component with HTML-like labels
const InfoCard = ({ id, title, items }) => (
  <Node
    id={id}
    label={
      <dot:table border="1" cellborder="0" cellspacing="0">
        <dot:tr>
          <dot:td bgcolor="navy">
            <dot:font color="white">
              <dot:b>{title}</dot:b>
            </dot:font>
          </dot:td>
        </dot:tr>
        {items.map((item, index) => (
          <dot:tr key={index}>
            <dot:td align="left">• {item}</dot:td>
          </dot:tr>
        ))}
      </dot:table>
    }
    shape="record"
  />
);

// Usage in graph
const ProjectDiagram = () => (
  <Digraph>
    <InfoCard
      id="requirements"
      title="Requirements"
      items={["User login", "Data processing", "Reporting"]}
    />
    <InfoCard
      id="implementation"
      title="Implementation"
      items={["React frontend", "Node.js API", "PostgreSQL DB"]}
    />

    <Edge targets={["requirements", "implementation"]} label="leads to" />
  </Digraph>
);

const dotString = await renderToDot(<ProjectDiagram />);
```

### Using the renderHTMLLike Function

```ts
import { renderHTMLLike } from "@ts-graphviz/react";

const htmlLabel = renderHTMLLike(
  <dot:table>
    <dot:tr>
      <dot:td>left</dot:td>
      <dot:td>right</dot:td>
    </dot:tr>
  </dot:table>
);
```

### Advanced Root Options

```ts
import { Digraph, Node, Edge, createRoot } from "@ts-graphviz/react";

// Basic usage
const root = createRoot();
await root.render(
  <Digraph>
    <Node id="A" />
    <Node id="B" />
    <Edge targets={["A", "B"]} />
  </Digraph>
);

// Container mode - render into existing graph
import { digraph } from 'ts-graphviz';
const container = digraph('MyGraph');
const containerRoot = createRoot({ container });
await containerRoot.render(
  <>
    <Node id="A" />
    <Node id="B" />
    <Edge targets={["A", "B"]} />
  </>
);

// Error handling options
const rootWithErrorHandling = createRoot({
  onUncaughtError: (error, errorInfo) => {
    console.error('Rendering error:', error);
    console.log('Component stack:', errorInfo.componentStack);
  },
  onCaughtError: (error, errorInfo) => {
    console.error('Caught error:', error);
  }
});

await rootWithErrorHandling.render(<MyComplexGraph />);
```

## Advanced Features

### Error Handling

The package provides robust error handling capabilities for rendering errors:

```ts
import { createRoot, renderToDot } from "@ts-graphviz/react";

// Error handling with createRoot
const root = createRoot({
  onUncaughtError: (error, errorInfo) => {
    console.error('Uncaught rendering error:', error.message);
    console.log('Component stack:', errorInfo.componentStack);
    // Send to error tracking service
    errorTracker.captureException(error, { extra: errorInfo });
  },
  onCaughtError: (error, errorInfo) => {
    console.error('Caught by error boundary:', error.message);
    // Handle recoverable errors
  }
});

await root.render(<MyGraph />);

// renderToDot also supports error handling
try {
  const dotString = await renderToDot(<ComplexGraph />);
} catch (error) {
  if (error.message.includes('Multiple top-level graphs')) {
    console.error('Invalid graph structure');
  }
}
```

### Ref as Prop Support

The package supports using `ref` to access and manipulate graph models directly, allowing for dynamic updates and interactions:

```ts
import { useRef } from 'react';
import { Digraph, Graph, Node, Edge, createRoot } from "@ts-graphviz/react";
import type { NodeModel, EdgeModel, GraphBaseModel } from 'ts-graphviz';

function MyGraphComponent() {
  const nodeRef = useRef<NodeModel>(null);
  const edgeRef = useRef<EdgeModel>(null);
  const digraphRef = useRef<GraphBaseModel>(null);
  const graphRef = useRef<GraphBaseModel>(null);

  const handleRender = async () => {
    // Example with Digraph component
    const digraphRoot = createRoot();
    await digraphRoot.render(
      <Digraph id="mygraph" ref={digraphRef}>
        <Node id="A" ref={nodeRef} label="Node A" />
        <Node id="B" label="Node B" />
        <Edge targets={['A', 'B']} ref={edgeRef} label="A to B" />
      </Digraph>
    );

    // Example with Graph component (undirected)
    const graphRoot = createRoot();
    await graphRoot.render(
      <Graph id="undirected-graph" ref={graphRef}>
        <Node id="X" label="Node X" />
        <Node id="Y" label="Node Y" />
        <Edge targets={['X', 'Y']} label="X -- Y" />
      </Graph>
    );

    // Access and manipulate the models directly
    if (nodeRef.current) {
      nodeRef.current.attributes.set('color', 'red');
      nodeRef.current.comment = 'Modified via ref';
    }

    if (edgeRef.current) {
      edgeRef.current.attributes.set('style', 'dashed');
    }

    console.log('Digraph nodes:', digraphRef.current?.nodes.length);
    console.log('Digraph edges:', digraphRef.current?.edges.length);
    console.log('Graph nodes:', graphRef.current?.nodes.length);
    console.log('Graph edges:', graphRef.current?.edges.length);
  };

  return (
    <button onClick={handleRender}>
      Render Graph
    </button>
  );
}
```

## Contributors 👥

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://blog.kamiazya.tech/"><img src="https://avatars0.githubusercontent.com/u/35218186?v=4?s=100" width="100px;" alt="Yuki Yamazaki"/><br /><sub><b>Yuki Yamazaki</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/commits?author=kamiazya" title="Code">💻</a> <a href="https://github.com/ts-graphviz/ts-graphviz/commits?author=kamiazya" title="Tests">⚠️</a> <a href="https://github.com/ts-graphviz/ts-graphviz/commits?author=kamiazya" title="Documentation">📖</a> <a href="#ideas-kamiazya" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://laysent.com"><img src="https://avatars2.githubusercontent.com/u/1191606?v=4?s=100" width="100px;" alt="LaySent"/><br /><sub><b>LaySent</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/issues?q=author%3Alaysent" title="Bug reports">🐛</a> <a href="https://github.com/ts-graphviz/ts-graphviz/commits?author=laysent" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/elasticdotventures"><img src="https://avatars0.githubusercontent.com/u/35611074?v=4?s=100" width="100px;" alt="elasticdotventures"/><br /><sub><b>elasticdotventures</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/commits?author=elasticdotventures" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ChristianMurphy"><img src="https://avatars.githubusercontent.com/u/3107513?v=4?s=100" width="100px;" alt="Christian Murphy"/><br /><sub><b>Christian Murphy</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/commits?author=ChristianMurphy" title="Code">💻</a> <a href="#ideas-ChristianMurphy" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/ts-graphviz/ts-graphviz/commits?author=ChristianMurphy" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ArtemAdamenko"><img src="https://avatars.githubusercontent.com/u/2178516?v=4?s=100" width="100px;" alt="Artem"/><br /><sub><b>Artem</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/issues?q=author%3AArtemAdamenko" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fredericohpandolfo"><img src="https://avatars.githubusercontent.com/u/24229136?v=4?s=100" width="100px;" alt="fredericohpandolfo"/><br /><sub><b>fredericohpandolfo</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/issues?q=author%3Afredericohpandolfo" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/diegoquinteiro"><img src="https://avatars.githubusercontent.com/u/1878108?v=4?s=100" width="100px;" alt="diegoquinteiro"/><br /><sub><b>diegoquinteiro</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/issues?q=author%3Adiegoquinteiro" title="Bug reports">🐛</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/robross0606"><img src="https://avatars.githubusercontent.com/u/2965467?v=4?s=100" width="100px;" alt="robross0606"/><br /><sub><b>robross0606</b></sub></a><br /><a href="#ideas-robross0606" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://blake-regalia.net"><img src="https://avatars.githubusercontent.com/u/1456400?v=4?s=100" width="100px;" alt="Blake Regalia"/><br /><sub><b>Blake Regalia</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/issues?q=author%3Ablake-regalia" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/bigbug"><img src="https://avatars.githubusercontent.com/u/27259?v=4?s=100" width="100px;" alt="bigbug"/><br /><sub><b>bigbug</b></sub></a><br /><a href="#question-bigbug" title="Answering Questions">💬</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/murawakimitsuhiro"><img src="https://avatars.githubusercontent.com/u/13833242?v=4?s=100" width="100px;" alt="mrwk"/><br /><sub><b>mrwk</b></sub></a><br /><a href="#question-murawakimitsuhiro" title="Answering Questions">💬</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/svdvonde"><img src="https://avatars.githubusercontent.com/u/2751783?v=4?s=100" width="100px;" alt="svdvonde"/><br /><sub><b>svdvonde</b></sub></a><br /><a href="#question-svdvonde" title="Answering Questions">💬</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/seethroughdev"><img src="https://avatars.githubusercontent.com/u/203779?v=4?s=100" width="100px;" alt="Adam"/><br /><sub><b>Adam</b></sub></a><br /><a href="#question-seethroughdev" title="Answering Questions">💬</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/trevor-scheer"><img src="https://avatars.githubusercontent.com/u/29644393?v=4?s=100" width="100px;" alt="Trevor Scheer"/><br /><sub><b>Trevor Scheer</b></sub></a><br /><a href="#a11y-trevor-scheer" title="Accessibility">️️️️♿️</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://pre.ms"><img src="https://avatars.githubusercontent.com/u/238277?v=4?s=100" width="100px;" alt="Prem Pillai"/><br /><sub><b>Prem Pillai</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/issues?q=author%3Acloud-on-prem" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/nagasawaryoya"><img src="https://avatars.githubusercontent.com/u/53528726?v=4?s=100" width="100px;" alt="nagasawaryoya"/><br /><sub><b>nagasawaryoya</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/commits?author=nagasawaryoya" title="Code">💻</a> <a href="https://github.com/ts-graphviz/ts-graphviz/commits?author=nagasawaryoya" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/tokidrill"><img src="https://avatars.githubusercontent.com/u/42460318?v=4?s=100" width="100px;" alt="YukiSasaki"/><br /><sub><b>YukiSasaki</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/commits?author=tokidrill" title="Code">💻</a> <a href="https://github.com/ts-graphviz/ts-graphviz/commits?author=tokidrill" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Madd0g"><img src="https://avatars.githubusercontent.com/u/1171003?v=4?s=100" width="100px;" alt="Madd0g"/><br /><sub><b>Madd0g</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/issues?q=author%3AMadd0g" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/j4k0xb"><img src="https://avatars.githubusercontent.com/u/55899582?v=4?s=100" width="100px;" alt="j4k0xb"/><br /><sub><b>j4k0xb</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/issues?q=author%3Aj4k0xb" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/haved"><img src="https://avatars.githubusercontent.com/u/3748845?v=4?s=100" width="100px;" alt="HKrogstie"/><br /><sub><b>HKrogstie</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/issues?q=author%3Ahaved" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/septatrix"><img src="https://avatars.githubusercontent.com/u/24257556?v=4?s=100" width="100px;" alt="Nils K"/><br /><sub><b>Nils K</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/issues?q=author%3Aseptatrix" title="Bug reports">🐛</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/hao2013"><img src="https://avatars.githubusercontent.com/u/67059492?v=4?s=100" width="100px;" alt="hao2013"/><br /><sub><b>hao2013</b></sub></a><br /><a href="#maintenance-hao2013" title="Maintenance">🚧</a> <a href="https://github.com/ts-graphviz/ts-graphviz/pulls?q=is%3Apr+reviewed-by%3Ahao2013" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.walterra.dev"><img src="https://avatars.githubusercontent.com/u/230104?v=4?s=100" width="100px;" alt="Walter Rafelsberger"/><br /><sub><b>Walter Rafelsberger</b></sub></a><br /><a href="#question-walterra" title="Answering Questions">💬</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors)
specification. Contributions of any kind welcome!

## License ⚖️

This software is released under the MIT License, see [LICENSE](https://github.com/ts-graphviz/ts-graphviz/blob/main/LICENSE).
