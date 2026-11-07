---
description: 探索用于图表创建和操作的核心 API。
---

# 核心功能

## TypeScript 友好型 API

`ts-graphviz` 提供了与 TypeScript 无缝集成的 API，具有强大的类型定义和完整的 IntelliSense 支持。这使得在开发过程中更容易发现错误，并改善了开发人员的体验。

**游乐场：**

```ts ts-graphviz:read-only
import { digraph, attribute as _ } from 'ts-graphviz';

const G = digraph('G', (g) => {
  g.node('A', { [_.color]: 'red' });
  g.edge(['A', 'B'], { [_.label]: 'A to B' });
});
```

:::tip
悬停在 `digraph` 或 `g.node` 或 `[_.color]` 上查看类型提示。
:::

**解释：**

- **强类型**：TypeScript 类型系统可确保使用正确的类型并防止错误。
- **IntelliSense 支持**：如 Visual Studio Code 等代码编辑器可以提供自动完成和文档提示。

### 面向对象的模型

除了 DOT DSL 之外，`ts-graphviz` 还提供了面向对象的 API，提供表示图表元素的模型类。这种方法利用了 TypeScript 的基于类的特性，允许更明确和细致的控制。

**模型类：**

- `Graph` / `Digraph`：表示整个图表。
- `Subgraph`：表示子图或集群。
- `Node`：表示图表中的节点。
- `Edge`：表示节点之间的边。

**示例：**

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

**解释：**

- **实例化类**：创建 `Node`、`Edge` 和 `Digraph` 的实例以构建图表。
- **向图表添加元素**：使用 `addNode` 和 `addEdge` 方法向图表中添加元素。
- **明确控制**：您可以直接操作每个元素。

**面向对象方法的优点：**

- **明确控制**：提供对图表元素的细粒度控制。
- **可扩展性**：允许您扩展类以创建自定义行为或属性。
- **与 TypeScript 对齐**：利用 TypeScript 的面向对象功能，使熟悉这些概念的开发者更直观。

---

## 两种 API：DOT DSL 与模型

`ts-graphviz` 提供两种操作图的方式，二者操作的是同一个图：

- **DOT DSL**：由工厂函数（`digraph`、`graph`、`strict.digraph`、`strict.graph`）返回。DOT 语句是它的方法，属性是它的属性，因此可以像写 DOT 一样编写图。参见[使用 DOT DSL 编写图](../03-guides/01-dot-dsl.md)。
- **模型 API**：类（`Digraph`、`Node`、`Edge` 等）及其方法，适用于把图当作数据来构建、读取或转换的程序，以及定义自己的类。参见[使用模型 API](../03-guides/02-model-api.md)。

```typescript
import { digraph, modelOf, toDot } from 'ts-graphviz';

const G = digraph('G', (g) => {
  g.rankdir = 'LR'; // rankdir = "LR";
  const a = g.node('A', { label: 'Start' }); // "A" [label = "Start";];
  g.edge([a, 'B']); // "A" -> "B";
});

toDot(G); // the DSL or its model
modelOf(G).createNode('C'); // the model behind the DSL
```
