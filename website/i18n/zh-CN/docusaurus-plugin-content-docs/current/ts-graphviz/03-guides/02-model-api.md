---
description: 使用 DOT Object Model（DOM），把图当作数据来构建、读取和转换。
---
# DOT Object Model（DOM）

名字沿用 Web 浏览器的 DOM，但没有事件、选择器和实时集合。

**DOT Object Model（DOM）** 是构成图的对象集合：`Digraph` / `Graph`、`Subgraph`、`Node`、`Edge`、默认属性语句以及注释。[DOT DSL](./01-dot-dsl.md) 用于像写 DOT 一样编写图，而 DOM 面向这样的程序：从其他数据构建图、读取或转换图，或者定义自己的类。

每个 DSL 都代表 DOM 中的一个模型：`modelOf(dsl)` 返回该模型，`dsl(model)` 返回模型的 DSL。二者操作的是同一个图。DSL 只包含 DOT 的词汇（属性、语句、`port`、`addComment`），本页介绍的内容都在模型上。注释没有 DSL：`dsl()` 不接受注释，`addComment` 直接返回 `CommentModel` 本身。

## 构建图

图保存添加到其中的内容。用模型的类或[模型套件](#模型套件)创建模型，再用 `addNode`、`addEdge` 和 `addSubgraph` 添加：

```typescript
import { Digraph, Edge, Node, Subgraph, toDot } from 'ts-graphviz';

const g = new Digraph('G', { rankdir: 'LR' });
const a = new Node('a', { label: 'Start' });
const b = new Node('b');
g.addNode(a);
g.addNode(b);
g.addEdge(new Edge([a, b], { color: 'red' }));
const s = new Subgraph('cluster_0', { label: 'Group' });
g.addSubgraph(s);
s.addNode(new Node('c'));

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
| `id` | 根图、子图或节点的名字（DOT 中的 ID） |
| `nodes`、`edges`、`subgraphs` | 图中的节点、边和子图；`nodes` 保存的是节点语句，不包括只出现在边中的节点（参见[常见问题](./01-dot-dsl.md#只出现在边中的节点不在-nodes-里)） |
| `statements` | 按添加顺序排列的节点、边、子图以及开头之外的默认属性语句，`toDot` 按此顺序输出；图自身的属性和开头的默认值写在它们之前 |
| `getNode(id)`、`getSubgraph(id)` | 按 id 获取节点或子图 |
| `existNode(id)`、`existEdge(edge)`、`existSubgraph(subgraph)` | 图中是否存在 |
| `removeNode(nodeOrId)`、`removeEdge(edge)`、`removeSubgraph(subgraph)` | 移除 |
| `addAttributeList(kind, attributes)` | 在当前位置添加一条默认属性语句（`node [...]` 等）并返回它 |

`removeNode` 只移除本图中的节点语句：指向该节点的边，以及子图中该节点的语句都会保留，Graphviz 渲染它们时会重新创建这个节点。若要去掉该节点，请在所有子图中一并移除它们，包括边分组（`b -> { a c }`）中的成员：

```typescript
import { fromDot, type GraphBaseModel } from 'ts-graphviz';

function removeNodeEverywhere(g: GraphBaseModel, id: string): void {
  for (const edge of g.edges) {
    // 端点，或分组中的成员
    if (edge.targets.flat().some((t) => t.id === id)) g.removeEdge(edge);
  }
  g.removeNode(id);
  // 子图有自己的语句
  for (const s of g.subgraphs) removeNodeEverywhere(s, id);
}

const g = fromDot('digraph { a; subgraph cluster_s { a -> b; } }');
removeNodeEverywhere(g, 'a');
```

一条边语句是一整条链：移除 `a -> b -> c` 或 `b -> { a c }` 时，`b -> c` 也会被移除。请把需要保留的连接重新添加回去。

## 属性

图、子图、节点、边和默认属性语句自己持有属性，并使用与 DOM 的 `Element` 相同名字的方法：

| 方法 | |
| --- | --- |
| `getAttribute(name)` | 值，或 `undefined` |
| `setAttribute(name, value)` | 设置一个 |
| `removeAttribute(name)` | 删除一个 |
| `hasAttribute(name)` | 是否已设置 |
| `getAttributeNames()` | 已设置的名字（按顺序） |
| `setAttributes(attributes)` | 从对象或条目设置多个 |
| `removeAttributes()` | 全部删除 |

```typescript
import { fromDot } from 'ts-graphviz';

const g = fromDot('digraph { a [label = "A"]; a -> b; }');
const a = g.getNode('a');
a?.setAttribute('color', 'red');
console.log(a?.getAttribute('label')); // 'A'
console.log(a?.getAttributeNames()); // ['label', 'color']
console.log(g.statements.map((s) => s.$$type)); // ['Node', 'Edge']
```

3.x 的名字（`get`、`set`、`delete`、`apply`、`clear`、`values`、`size`，以及节点或边的 `attributes`）在 v5 之前仍可使用，但已弃用。

## 默认属性语句

与 DOT 一样，默认属性语句只作用于它之后的内容（已弃用的 `legacyModels` 类则会把每一条都合并到开头的默认值中；参见[模型套件](#模型套件)）。`addAttributeList` 添加一条默认属性语句并返回它的列表；保留它，之后就可以修改这些默认值：

```typescript
import { Digraph, Node, toDot } from 'ts-graphviz';

const g = new Digraph();
g.addNode(new Node('a'));
const defaults = g.addAttributeList('Node', { shape: 'box' }); // 作用于之后的内容
g.addNode(new Node('b'));
defaults.setAttribute('color', 'red');

console.log(toDot(g));
// digraph {
//   "a";
//   node [
//     shape = "box";
//     color = "red";
//   ];
//   "b";
// }
```

在其他任何语句之前添加的语句会并入开头的默认值。`attributes`（`attributes.node` 等）已弃用：它只表示开头的默认值。

## 注释

除注释外，每个模型都可以带注释：`addComment(text, { position, kind })` 添加一条注释并返回它，`comments` 列出所有注释，`removeComment(comment)` 移除其中一条。注释是冻结的 `CommentModel`，包含 `text`、`kind`（`'Slash'`、`'Block'`、`'Macro'`，或按 `fromModel` 的 `commentKind` 选项输出的 `undefined`）和 `position`（`'leading'`、`'trailing'`，在图或子图上还可以是 `'end'`）。

```typescript
import { Digraph, Node, toDot } from 'ts-graphviz';

const g = new Digraph('G');
const a = new Node('a');
g.addNode(a);
a.addComment('hello');
console.log(a.comments.map((c) => [c.text, c.position])); // [['hello', 'leading']]

console.log(toDot(g));
// digraph "G" {
//   // hello
//   "a";
// }
```

`fromDot` 会保留语句之间的注释及其种类和位置，`toDot` 会把它们写回原处。有两个例外：语句内部的注释（`a -> /* note */ b;`、`a [ /* note */ label = x ]`）不会保留；图属性赋值（`color = blue;`）会写在各语句之前，因此它旁边的注释会成为下一条语句的前置注释。模型的 `comment` 已弃用：它读写第一条前置注释。

## 模型的类型守卫

`isNodeModel`、`isEdgeModel`、`isSubgraphModel`、`isRootGraphModel`、`isAttributeListModel`、`isDotModel` 和 `isCommentModel` 判断一个值是什么。DSL 不是模型，因此它们对 DSL 返回 false；请检查 `modelOf(x)` 或 `$$type`：

```typescript
import { digraph, isNodeModel, modelOf } from 'ts-graphviz';

const G = digraph((g) => {
  g.node('a');
});

const nodes = modelOf(G).statements.filter(isNodeModel);
console.log(nodes.length); // 1
```

## 模型套件

模型套件（model kit）是一组相互配合的模型类，以及用它们创建模型的操作。`createModelKit(classes)` 创建一个套件，`defaultModelKit` 是默认类的套件。`withModelKit(classes)` 返回用套件创建的工厂函数（`digraph`、`graph`、`strict.digraph`、`strict.graph`）；`fromDot` 和 `fromDotAll` 通过 `convert.models` 接受这些类。未指定的类使用默认类。图不持有套件：添加什么，它就保存什么。

```typescript
import { Node, withModelKit } from 'ts-graphviz';

class MyNode extends Node {}

const { digraph } = withModelKit({ Node: MyNode });
digraph((g) => {
  g.node('a'); // MyNode 的 DSL
});
```

套件的 `createDigraph`、`createGraph`、`createSubgraph`、`createNode` 和 `createEdge` 只负责创建：返回的模型在被添加之前不属于任何图。

```typescript
import { createModelKit, Node } from 'ts-graphviz';

class MyNode extends Node {}

const kit = createModelKit({ Node: MyNode });
const G = kit.createDigraph('G');
const a = kit.createNode('a'); // MyNode，尚未加入任何图
const b = kit.createNode('b');
G.addNode(a);
G.addNode(b);
G.addEdge(kit.createEdge([a, b])); // 只添加边
```

`legacyModels`（`LegacyGraph`、`LegacyDigraph`、`LegacySubgraph`）是 3.x 的类，会把所有默认属性语句合并为每个图一组默认值；`ts-graphviz/legacy` 的所有工厂函数都使用它们（参见 [DOT 的语句顺序](./01-dot-dsl.md#dot-的语句顺序)）。要用它们手动构建图，请用 `createModelKit(legacyModels)` 创建，这样子图也是旧版的类。它们已弃用，将在 v5 中移除。

自定义类、带类型的套件和类型扩展，请参阅[扩展 ts-graphviz](./05-extending-ts-graphviz.md)。
