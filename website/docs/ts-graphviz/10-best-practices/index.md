---
description: Best practices for effectively using ts-graphviz in projects.
---
# Best Practices

## Leveraging TypeScript Features

Utilize TypeScript's interfaces and types for better type safety.

```typescript
interface CustomNodeOptions {
  id: string;
  label: string;
  color?: string;
}

function addCustomNodes(g, nodes: CustomNodeOptions[]) {
  nodes.forEach((node) => {
    g.node(node.id, { label: node.label, color: node.color });
  });
}

// Usage
const nodes = [
  { id: 'A', label: 'Node A', color: 'red' },
  { id: 'B', label: 'Node B' },
];

const G = digraph('G', (g) => {
  addCustomNodes(g, nodes);
});
```

**Explanation:**

- **Interfaces**: `CustomNodeOptions` defines the expected structure of node options.
- **Type Safety**: Provides compile-time checks, reducing runtime errors.
