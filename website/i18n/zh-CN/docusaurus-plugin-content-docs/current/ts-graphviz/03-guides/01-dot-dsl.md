---
description: 使用 DOT DSL，像写 DOT 一样逐条语句编写图。
---
# 使用 DOT DSL 编写图

工厂函数 `digraph()`、`graph()`、`strict.digraph()` 和 `strict.graph()` 返回图的 **DOT DSL**。它读起来就像 DOT：DOT 语句是它的方法，属性是它的属性。会用 DOT 写图，就会用 DSL 写图。

```typescript
import { digraph, toDot } from 'ts-graphviz';

const G = digraph('G', (g) => {
  g.rankdir = 'LR';
  g.node({ shape: 'box' });
  const a = g.node('a', { label: 'Start' });
  g.edge([a, 'b', 'c']);
});

console.log(toDot(G));
// digraph "G" {
//   rankdir = "LR";
//   node [
//     shape = "box";
//   ];
//   "a" [
//     label = "Start";
//   ];
//   "a" -> "b" -> "c";
// }
```

DSL 代表图的模型，即 [DOT Object Model（DOM）](./02-model-api.md)：模型的每个成员都以原名出现在 DSL 上，与属性并列。

## 从 DOT 到 DSL

| DOT | DSL |
| --- | --- |
| `digraph G { ... }` | `digraph('G', (g) => { ... })` |
| `strict graph { ... }` | `strict.graph((g) => { ... })` |
| `rankdir = LR;` | `g.rankdir = 'LR';` |
| `a [label = "A"];` | `g.node('a', { label: 'A' });` |
| `a -> b -> c;` | `g.edge(['a', 'b', 'c']);` |
| `c -> {d e};` | `g.edge(['c', ['d', 'e']]);` |
| `a:p1:n -> a:p2:s;` | `g.edge(['a:p1:n', a.port({ port: 'p2', compass: 's' })]);` |
| `node [shape = box];` | `g.node({ shape: 'box' });` |
| `edge [color = gray];` | `g.edge({ color: 'gray' });` |
| `graph [fontname = Helvetica];` | `g.graph({ fontname: 'Helvetica' });` |
| `subgraph cluster_0 { label = Group; d; e; }` | `g.subgraph('cluster_0', { label: 'Group' }, (s) => { s.node('d'); s.node('e'); });` |
| `{ rank = same; b; c; }` | `g.subgraph({ rank: 'same' }, (s) => { s.node('b'); s.node('c'); });` |
| `// note` | `a.addComment('note');` |

合在一起：

```typescript
import { digraph, toDot } from 'ts-graphviz';

const G = digraph('G', (g) => {
  g.node({ shape: 'box' });
  const a = g.node('a', { label: 'Start' });
  g.node('b');
  g.edge([a, 'b', 'c']);
  g.edge(['c', ['d', 'e']]);
  g.edge(['a:p1:n', a.port({ port: 'p2', compass: 's' })]);
  g.subgraph('cluster_0', { label: 'Group' }, (s) => {
    s.node('d');
    s.node('e');
  });
  g.subgraph({ rank: 'same' }, (s) => {
    s.node('b');
    s.node('c');
  });
});

console.log(toDot(G));
// digraph "G" {
//   node [
//     shape = "box";
//   ];
//   "a" [
//     label = "Start";
//   ];
//   "b";
//   "a" -> "b" -> "c";
//   "c" -> {"d" "e"};
//   "a":"p1":"n" -> "a":"p2":"s";
//   subgraph "cluster_0" {
//     label = "Group";
//     "d";
//     "e";
//   }
//   subgraph {
//     rank = "same";
//     "b";
//     "c";
//   }
// }
```

如果图中已有该 id 的节点或子图，`g.node(id)` 和 `g.subgraph(id)` 会返回它，否则会创建一个，与 DOT 中同一个名字写两次时一样。回调函数接收节点、边或子图的 DSL，方法也返回同一个 DSL。

属性名带有类型：编辑器会补全它们并检查取值。id 以 `cluster` 开头的子图接受簇的属性（`label`、`color` 等）。

## 属性

属性就是以其名字命名的属性。赋值 `undefined` 或使用 `delete` 会删除它：

```typescript
import { digraph } from 'ts-graphviz';

digraph((g) => {
  const a = g.node('a');
  a.label = 'A';
  a.color = 'red';
  delete a.label; // 删除该属性
  a.color = undefined; // 赋值 undefined 也会删除
  console.log(a.label); // undefined
});
```

DOM 的方法同样可用，并接受任意属性名，例如保存在变量中的名字：

```typescript
import { digraph } from 'ts-graphviz';

digraph((g) => {
  const a = g.node('a');
  a.setAttribute('label', 'A');
  a.setAttributes({ color: 'red', shape: 'box' });
  console.log(a.getAttribute('label')); // 'A'
  console.log(a.hasAttribute('fontname')); // false
  console.log(a.getAttributeNames()); // ['label', 'color', 'shape']
  a.removeAttribute('color');
  a.removeAttributes(); // 全部删除
});
```

## 名字

模型自身的成员在 DSL 上保持原名，并且没有与 Graphviz 属性同名的成员：

| DSL 写法 | 含义 |
| --- | --- |
| `a.nodeId`、`g.graphId`、`s.subgraphId` | 节点、根图或子图的名字（DOT 中的 ID） |
| `a.id`、`a.comment`、`g.size` | Graphviz 的属性 `id`、`comment` 和 `size` |
| `g.nodes`、`g.edges`、`g.subgraphs`、`g.statements` | 图的内容（以 DSL 形式） |
| `g.getNode('a')`、`g.createNode('a')`、`a.port('p')` | 模型的方法 |
| `a.getAttribute('label')`、`a.addComment('note')` | DOM 的方法 |
| `a.$$type` | 模型的种类（`'Node'`、`'Edge'` 等） |

```typescript
import { digraph } from 'ts-graphviz';

digraph('G', (g) => {
  const a = g.node('a');
  a.id = 'svg-a';
  console.log(a.nodeId); // 'a'
  console.log(a.id); // 'svg-a'
  console.log(g.graphId); // 'G'
  console.log(a.$$type); // 'Node'
});
```

只有两种情况需要在前面加 `$`：

- 自定义类的成员与 Graphviz 属性同名：`weight` 是属性，因此方法 `weight()` 写作 `$weight()`；
- 自定义类的成员与 DOT 语句同名：`node()`、`edge()`、`subgraph()` 和 `graph()` 是 DSL 的语句，因此自定义类的方法 `node()` 写作 `$node()`。

```typescript
import { Edge, withContext } from 'ts-graphviz';

class MyEdge extends Edge {
  cost() {
    return 1;
  }
  weight() {
    return 2;
  }
}

const { digraph } = withContext({ Edge: MyEdge });
digraph((g) => {
  const e = g.edge(['a', 'b']);
  console.log(e.cost()); // 1
  console.log(e.$weight()); // 2
  console.log(e.weight); // undefined：Graphviz 属性
});
```

v4 中已弃用的成员（`attributes`、模型的 `id`、模型的 `comment`、`get`、`set` 等 3.x 的属性方法）不在 DSL 的类型中。在迁移完成之前，请通过 `modelOf(x)` 读取，或在前面加 `$` 使用。

## 注释

`addComment` 为节点、边、子图、图或默认属性语句添加注释。默认写在语句之前；`position: 'trailing'` 写在语句之后，图或子图上的 `position: 'end'` 写在主体末尾。`kind` 为 `'Slash'`（`//`）、`'Block'`（`/* */`）或 `'Macro'`（`#`）。

```typescript
import { digraph, toDot } from 'ts-graphviz';

const G = digraph((g) => {
  const a = g.node('a');
  a.addComment('start');
  a.addComment('note', { position: 'trailing', kind: 'Block' });
  a.comment = 'kept by Graphviz'; // Graphviz 的 comment 属性
});

console.log(toDot(G));
// digraph {
//   // start
//   "a" [
//     comment = "kept by Graphviz";
//   ]; /* note */
// }
```

`comments` 列出所有注释，`removeComment(comment)` 移除其中一条。在 DSL 上，`comment` 是 Graphviz 的属性，Graphviz 会把它写入输出；DOT 源码中的注释是 `CommentModel`。

## 编辑解析得到的图

`fromDot` 返回模型。`dsl()` 返回模型的 DSL，因此解析得到的图也可以用同样的方式编辑：

```typescript
import { dsl, fromDot, toDot } from 'ts-graphviz';

const g = dsl(fromDot('digraph { a [label = "A"]; a -> b; }'));
g.node('a').color = 'red';
g.edge(['b', 'c']);

console.log(toDot(g));
```

通过 DSL 访问到的每个模型都是 DSL，而且一个模型只有一个 DSL，所以 DSL 可以用 `===` 比较。`modelOf(x)` 返回对应的模型。`toDot`、`fromModel` 和适配器的 `toBlob` 既接受模型，也接受 DSL。

## DOT 的语句顺序

与 DOT 一样，默认属性语句只作用于它之后的内容。`g.node({ ... })`、`g.edge({ ... })` 和 `g.graph({ ... })` 在调用的位置添加一条默认属性语句并返回它的 DSL；保留这个 DSL，之后就可以修改这些默认值：

```typescript
import { digraph, toDot } from 'ts-graphviz';

const G = digraph((g) => {
  g.node('a');
  const defaults = g.node({ shape: 'box' }); // 作用于之后的内容
  g.node('b');
  defaults.color = 'red';
});

console.log(toDot(G));
// digraph {
//   "a";
//   node [
//     shape = "box";
//     color = "red";
//   ];
//   "b";
// }
```

`fromDot` 会把源码中的每条默认属性语句保留在原位置，因此 `node [color=red]; a; node [color=blue]; b` 与 Graphviz 一样，`a` 为红色、`b` 为蓝色。节点自身设置的属性（`g.node('a', { color: 'green' })`）总是优先于默认值。

3.x 会把所有默认属性语句合并为每个图一组默认值并写在最前面，因此写在其他语句之后的默认值也会作用于它之前的内容。在迁移到 v4 期间，如需保持 3.x 的输出，请从 `ts-graphviz/legacy` 导入：它与 `ts-graphviz` 的名字相同，其工厂函数和 `fromDot` 使用 3.x 的类（`legacyModels`）。该入口已弃用，将在 v5 中移除。以原名导出的类（`Digraph`、`Graph`、`Subgraph`）在这里也是 v4 的类：自己构造图时，请使用 `LegacyDigraph`、`LegacyGraph` 或 `LegacySubgraph`。

```typescript
import { digraph, toDot } from 'ts-graphviz/legacy';

const G = digraph((g) => {
  g.node('a');
  g.node({ color: 'blue' }); // 与 3.x 一样，a 也是蓝色
});

console.log(toDot(G));
// digraph {
//   node [
//     color = "blue";
//   ];
//   "a";
// }
```

## 常见问题

### 只出现在边中的节点不在 `nodes` 里

```typescript
import { dsl, fromDot } from 'ts-graphviz';

const g = dsl(fromDot('digraph { a; a -> b; }'));
console.log(g.nodes.map((n) => n.nodeId)); // ['a']
console.log(g.getNode('b')); // undefined
```

在 DOT 中，边会创建它所提到的节点。但模型只按 id 记录边的端点：`nodes` 保存的是以节点语句写出的节点，而不是 Graphviz 意义上图的全部节点。一个节点可能属于多个子图，子图里的 `a -> b` 也可能指向写在子图外的节点，因此模型不做推测。要让节点出现在 `nodes` 中，请用 `g.node('b')` 声明它，或者读取边端点的 id。

### `isNodeModel(dsl)` 返回 false

DSL 代表一个模型，但它本身不是模型，因此模型的类型守卫（`isNodeModel`、`isRootGraphModel` 等）对 DSL 返回 false。请检查 `$$type` 或模型本身：

```typescript
import { digraph, isNodeModel, modelOf } from 'ts-graphviz';

digraph((g) => {
  const a = g.node('a');
  console.log(isNodeModel(a)); // false
  console.log(isNodeModel(modelOf(a))); // true
  console.log(a.$$type === 'Node'); // true
});
```

### 写在其他语句之后的默认值改变了 3.x 的输出

在 v4 中，它与 DOT 一样只作用于之后的内容。要让默认值作用于整个图，请把它写在其他语句之前；或者暂时从 `ts-graphviz/legacy` 导入，保持 3.x 的输出。

### `attributes` 去哪儿了？

`g.attributes.node`（在 DSL 上为 `g.$attributes.node`）已弃用：它只表示图开头的默认值。请保留 `g.node({ ... })` 返回的 DSL，并通过它修改默认值。
