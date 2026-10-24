---
description: 在项目中有效使用 ts-graphviz 的最佳实践。
---
# 最佳实践

## 利用 TypeScript 功能

利用 TypeScript 的接口和类型以获得更好的类型安全。

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

**说明：**

- **接口**：`CustomNodeOptions` 定义了节点选项的预期结构。
- **类型安全**：提供编译时检查，减少运行时错误。
