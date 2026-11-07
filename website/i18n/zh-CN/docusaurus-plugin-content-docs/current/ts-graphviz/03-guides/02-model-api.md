---
description: 使用模型 API，把图当作数据来构建、读取和转换。
---
# 使用模型 API

模型是构成图的数据：`Digraph` / `Graph`、`Subgraph`、`Node`、`Edge` 以及默认属性列表。[DOT DSL](./01-dot-dsl.md) 用于像写 DOT 一样编写图，而模型 API 面向这样的程序：从其他数据构建图、读取或转换图，或者定义自己的类。

每个 DSL 都代表一个模型：`modelOf(dsl)` 返回该模型，`dsl(model)` 返回模型的 DSL。两种 API 操作的是同一个图。

## 构建图

图通过 `createNode`、`createEdge` 和 `createSubgraph` 创建其内容，创建时使用该图的模型上下文中的类：

```typescript
import { Digraph, toDot } from 'ts-graphviz';

const g = new Digraph('G', { rankdir: 'LR' });
const a = g.createNode('a', { label: 'Start' });
const b = g.createNode('b');
g.createEdge([a, b], { color: 'red' });
const s = g.createSubgraph('cluster_0', { label: 'Group' });
s.createNode('c');

console.log(toDot(g));
// digraph "G" {
//   rankdir = "LR";
//   "a" [
//     label = "Start";
//   ];
//   "b";
//   "a" -> "b" [
//     color = "red";
//   ];
//   subgraph "cluster_0" {
//     label = "Group";
//     "c";
//   }
// }
```

单独创建的模型用 `addNode`、`addEdge` 和 `addSubgraph` 添加：

```typescript
import { Digraph, Edge, Node } from 'ts-graphviz';

const g = new Digraph();
const a = new Node('a');
const b = new Node('b');
g.addNode(a);
g.addNode(b);
g.addEdge(new Edge([a, b]));
```

## 读取和修改图

| 成员 | |
| --- | --- |
| `nodes`、`edges`、`subgraphs` | 图中的节点、边和子图 |
| `statements` | 按添加顺序排列的内容，`toDot` 按此顺序输出 |
| `getNode(id)`、`getSubgraph(id)` | 按 id 获取节点或子图 |
| `existNode(id)`、`existEdge(edge)`、`existSubgraph(subgraph)` | 图中是否存在 |
| `removeNode(nodeOrId)`、`removeEdge(edge)`、`removeSubgraph(subgraph)` | 移除 |
| `get(key)`、`set(key, value)`、`apply(attributes)`、`delete(key)` | 图自身的属性 |
| `attributes.node`、`attributes.edge`、`attributes.graph` | 默认属性列表（`node [...]` 等） |
| `addAttributeList(kind, attributes)` | 添加一条默认属性语句 |

节点和边的属性位于 `attributes`：

```typescript
import { fromDot } from 'ts-graphviz';

const g = fromDot('digraph { a [label = "A"]; a -> b; }');
const a = g.getNode('a');
a?.attributes.set('color', 'red');
console.log(a?.attributes.get('label')); // 'A'
console.log(g.statements.map((s) => s.$$type)); // ['Node', 'Edge']
g.removeNode('a');
```

## 模型的类型守卫

`isNodeModel`、`isEdgeModel`、`isSubgraphModel`、`isRootGraphModel`、`isAttributeListModel` 和 `isDotModel` 判断一个值是什么。DSL 不是模型，因此它们对 DSL 返回 false；请检查 `modelOf(x)` 或 `$$type`：

```typescript
import { digraph, isNodeModel, modelOf } from 'ts-graphviz';

const G = digraph((g) => {
  g.node('a');
});

const nodes = modelOf(G).statements.filter(isNodeModel);
console.log(nodes.length); // 1
```

## 模型上下文

模型上下文是图创建其内容时使用的一组类。`withContext(models)` 返回该上下文的工厂函数（`digraph`、`graph`、`strict`）；`graph.with(models)` 设置图的上下文；`fromDot` 和 `fromDotAll` 通过 `convert.models` 接受上下文。未指定的类保持默认。

```typescript
import { Node, withContext } from 'ts-graphviz';

class MyNode extends Node {}

const { digraph } = withContext({ Node: MyNode });
digraph((g) => {
  g.node('a'); // the DSL of a MyNode
});
```

`orderedModels` 是一个模型上下文，其中的图会像 DOT 一样把每条默认属性语句保留在原位置；`ts-graphviz/ordered` 的所有工厂函数都使用它（参见 [DOT 的语句顺序](./01-dot-dsl.md#dot-的语句顺序)）。

自定义类、带类型的上下文和类型扩展，请参阅[扩展 ts-graphviz](./05-extending-ts-graphviz.md)。
