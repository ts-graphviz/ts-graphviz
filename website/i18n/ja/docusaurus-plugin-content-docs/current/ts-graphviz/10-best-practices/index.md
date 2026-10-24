---
description: プロジェクトでts-graphvizを効果的に使うためのベストプラクティス
---
# ベストプラクティス

## TypeScript の機能を活用する

TypeScript のインターフェイスや型を利用して、より安全な型チェックを行いましょう。

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

// 使用例
const nodes = [
  { id: 'A', label: 'Node A', color: 'red' },
  { id: 'B', label: 'Node B' },
];

const G = digraph('G', (g) => {
  addCustomNodes(g, nodes);
});
```

**解説:**

- **インターフェイス**：`CustomNodeOptions` はノードオプションの期待される構造を定義しています。
- **型安全性**：コンパイル時のチェックを提供し、実行時のエラーを減らします。
