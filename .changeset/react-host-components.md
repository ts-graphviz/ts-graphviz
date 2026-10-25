---
"@ts-graphviz/react": minor
---

Render through host components: the renderer adds the models when React commits, instead of hooks that made and registered them during render (#1753).

- **The statements of a graph follow the element tree**, also across re-renders. Children that are reordered, inserted, removed or rendered conditionally, keyed lists, fragments and arrays all keep the element order. Before, a reorder could remove every node, since the cleanup of one fiber removed the node with the same id as another's.
- **StrictMode, Suspense and discarded renders leave nothing behind.** Nothing is added before the commit, so an edge is no longer written twice under StrictMode, and a Suspense fallback's statements go when its content shows.
- **Refs resolve to the models** through the host instances, and follow a node whose `id` or an edge whose `targets` change (a new id or new targets make a new model).
- **Attributes follow the props.** A prop removed on update clears its attribute, and attributes are written in the order of the props.
- **`GraphPortal`** adds its children to a graph with the given id rendered anywhere in the tree (or in the container), after that graph's own children.
- **Container mode:** a re-render replaces only the statements the renderer added before, and unmounting removes them. Statements the container already had stay first.
- **Models are made by the graph they go to** (`createNode` / `createEdge` / `createSubgraph`), so a graph class (given through `models`, or a container's) that overrides them still applies.
- **Breaking:** `useDigraph`, `useGraph`, `useSubgraph`, `useNode` and `useEdge` are removed. They made models during render, which host components replace. Render the components, and get models through `ref` or `useCurrentGraph()`.
- **Breaking:** a `<Node>` or `<Edge>` outside a graph throws `<Node> must be rendered inside a Digraph, Graph or Subgraph.` A `dot:*` element outside an HTML-like label throws a `TypeError`.
- **HTML-like labels:**
  - only React elements are rendered as elements, and other objects among the children throw a `TypeError`;
  - an array nested in an array counts toward `maxDepth`;
  - an array that contains itself throws a `TypeError`.
