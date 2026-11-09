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

除了声明式风格外，`ts-graphviz` 还提供了面向对象的 API，提供表示图表元素的模型类。这种方法利用了 TypeScript 的基于类的特性，允许更明确和细致的控制。

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

## 理解 API：声明式 vs. 命令式

随着您对 `ts-graphviz` 的熟悉，您将遇到构建图表的两种主要风格：**声明式** 和 **命令式** API。

### 声明式 API

声明式 API 提供了一种简洁且易读的方式来定义您的图表。它在回调函数中使用 `node`、`edge` 和 `subgraph` 等方法来构建图表结构。

**示例：**

```typescript
import { digraph } from 'ts-graphviz';

const G = digraph('G', (g) => {
  g.node('A');
  g.node('B');
  g.edge(['A', 'B']);
});
```

**解释：**

- **图表工厂函数**：`digraph` 函数创建一个新图表并提供上下文 `g`。
- **添加元素**：在上下文中使用 `g.node` 和 `g.edge` 添加节点和边。
- **可读性**：结构反映了图表的逻辑结构，使其更易于阅读。

工厂函数返回图表的 **DOT DSL**，读起来与 DOT 相同：

- **语句**：`node`、`edge`、`subgraph` 和 `graph` 是方法，对应同名的 DOT 语句。`g.node({ ... })`、`g.edge({ ... })` 和 `g.graph({ ... })` 是默认属性语句（`node [...]` 等）。
- **属性**：属性是以其名称命名的属性。赋值 `undefined` 或使用 `delete` 会删除它。
- **模型自身的成员**前加 `$`：`a.$id` 是节点的名称（`a.id` 是 Graphviz 的 `id` 属性），此外还有 `g.$nodes`、`g.$getNode('A')`、`a.$addComment(...)` 等。
- **从 DSL 得到的模型都是 DSL。** `modelOf()` 返回模型，`dsl()` 返回模型（例如 `fromDot` 返回的模型）的 DSL。`toDot` 和适配器两者都接受。

```typescript
import { digraph, modelOf, toDot } from 'ts-graphviz';

const G = digraph('G', (g) => {
  g.rankdir = 'LR'; // rankdir = "LR";
  g.node({ shape: 'box' }); // node [shape = "box";];
  const a = g.node('A');
  a.label = 'Start'; // "A" [label = "Start";];
  a.id = 'svg-a'; // the Graphviz id attribute
  console.log(a.$id); // 'A': the node's name
  g.edge([a, 'B']); // "A" -> "B";
});

toDot(G); // the DSL or its model
modelOf(G); // the RootGraphModel
```

### 命令式 API

命令式 API 提供了对图表元素创建和操作的明确控制。它使用面向对象的方法逐步构建图表。

**示例：**

```typescript
import { Digraph } from 'ts-graphviz';

const G = new Digraph('G');

const nodeA = G.createNode('A');
const nodeB = G.createNode('B');
G.createEdge([nodeA, nodeB]);
```

**解释：**

- **实例化图表**：创建一个新的 `Digraph` 实例。
- **创建节点和边**：使用 `createNode` 和 `createEdge` 方法明确添加元素。
- **明确控制**：这种风格使您对创建过程拥有更多控制。

**选择合适的 API**

- **声明式 API**：适合使用更少的代码快速定义图表结构。
- **命令式 API**：当您需要对图表元素的创建和操作进行明确控制时非常有用。
