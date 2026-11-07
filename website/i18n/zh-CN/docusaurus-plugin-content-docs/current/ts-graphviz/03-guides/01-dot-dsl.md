---
description: 使用 DOT DSL，像写 DOT 一样逐条语句编写图。
---
# 使用 DOT DSL 编写图

工厂函数 `digraph()`、`graph()` 和 `strict.*` 返回图的 **DOT DSL**。它读起来就像 DOT：DOT 语句是它的方法，属性是它的属性。会用 DOT 写图，就会用 DSL 写图。

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

如果程序需要把图当作数据来构建、读取或转换，请参阅[使用模型 API](./02-model-api.md)。

## 从 DOT 到 DSL

| DOT | DSL |
| --- | --- |
| `digraph G { ... }` | `digraph('G', (g) => { ... })` |
| `strict graph { ... }` | `strict.graph((g) => { ... })` |
| `rankdir = LR;` | `g.rankdir = 'LR';` |
| `a [label = "A"];` | `g.node('a', { label: 'A' });` |
| `a -> b -> c;` | `g.edge(['a', 'b', 'c']);` |
| `c -> {d e};` | `g.edge(['c', ['d', 'e']]);` |
| `a:p1:n -> a:p2:s;` | `g.edge(['a:p1:n', a.$port({ port: 'p2', compass: 's' })]);` |
| `node [shape = box];` | `g.node({ shape: 'box' });` |
| `edge [color = gray];` | `g.edge({ color: 'gray' });` |
| `graph [fontname = Helvetica];` | `g.graph({ fontname: 'Helvetica' });` |
| `subgraph cluster_0 { label = Group; d; e; }` | `g.subgraph('cluster_0', { label: 'Group' }, (s) => { s.node('d'); s.node('e'); });` |
| `{ rank = same; b; c; }` | `g.subgraph({ rank: 'same' }, (s) => { s.node('b'); s.node('c'); });` |

合在一起：

```typescript
import { digraph, toDot } from 'ts-graphviz';

const G = digraph('G', (g) => {
  g.node({ shape: 'box' });
  const a = g.node('a', { label: 'Start' });
  g.node('b');
  g.edge([a, 'b', 'c']);
  g.edge(['c', ['d', 'e']]);
  g.edge(['a:p1:n', a.$port({ port: 'p2', compass: 's' })]);
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

## 属性就是属性

按属性名直接读取、写入和删除属性：

```typescript
import { digraph } from 'ts-graphviz';

digraph((g) => {
  const a = g.node('a');
  a.label = 'A';
  a.color = 'red';
  delete a.label; // 移除该属性
  a.color = undefined; // 赋值 undefined 也会移除
  console.log(a.label); // undefined
});
```

属性也可以用 `attribute` 常量（`a[attribute.label]`）来写；通过扩展类型添加的属性（参见[扩展 ts-graphviz](./05-extending-ts-graphviz.md)）也同样可以这样写。

## `$` 规则

属性使用原本的名字，因此模型自身的成员在前面加上 `$`：

| DSL 写法 | 含义 |
| --- | --- |
| `a.$id` | 节点的名字，即 DOT 中的 id |
| `a.id` | Graphviz 的 `id` 属性（SVG 元素的 id） |
| `a.$comment`、`g.$nodes`、`g.$edges`、`g.$subgraphs` | 模型的成员 |
| `g.$getNode('a')`、`g.$createNode('a')`、`a.$port('p')` | 模型的方法 |
| `a.$$type` | 以 `$$` 开头的成员保持原名 |

```typescript
import { digraph } from 'ts-graphviz';

digraph((g) => {
  const a = g.node('a');
  a.id = 'svg-a';
  console.log(a.$id); // 'a'
  console.log(a.id); // 'svg-a'
  console.log(a.$$type); // 'Node'
});
```

自定义类的成员遵循同样的规则：方法 `hello()` 写作 `$hello()`，名为 `$foo` 的成员写作 `$$foo`。

```typescript
import { Digraph, dsl } from 'ts-graphviz';

class MyDigraph extends Digraph {
  hello() {
    return `${this.nodes.length} nodes`;
  }
}

const g = dsl(new MyDigraph());
g.node('a');
console.log(g.$hello()); // '1 nodes'
```

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

在 DOT 中，默认属性语句（`node [...]` 等）只作用于它之后的内容。默认模型每个图只保存一组默认值，并写在最前面，因此最后的值会作用于所有未自行设置该属性的节点（在节点上设置的属性，例如 `g.node('a', { color: 'green' })`，总是优先于默认值）。要按 DOT 的含义编写图，请从 `ts-graphviz/ordered` 导入：它与 `ts-graphviz` 的名字相同，使用把每条默认属性语句保留在原位置的模型。

```typescript
import { digraph, toDot } from 'ts-graphviz/ordered';

const G = digraph((g) => {
  g.node({ color: 'red' });
  g.node('a'); // red
  g.node({ color: 'blue' });
  g.node('b'); // blue
});

console.log(toDot(G));
// digraph {
//   node [
//     color = "red";
//   ];
//   "a";
//   node [
//     color = "blue";
//   ];
//   "b";
// }
```

`ts-graphviz/ordered` 的 `fromDot` 也会读入同样的模型，因此经过 `toDot(fromDot(source))` 后，默认属性语句的位置保持不变。（图自身的属性仍写在最前面，因此在子图之后设置的属性（在 DOT 中子图不会继承它）会移到子图之前。）在 `ts-graphviz` 中显式的写法是 `withContext(orderedModels)` 和 `fromDot(source, { convert: { models: orderedModels } })`：

```typescript
import { fromDot, orderedModels, withContext } from 'ts-graphviz';

const { digraph } = withContext(orderedModels);
const G = digraph((g) => {
  g.node('a');
  g.edge({ color: 'red' }); // 作用于其后的边
  g.edge(['a', 'b']);
});

const parsed = fromDot('digraph { node [color=red]; a; node [color=blue]; b; }', {
  convert: { models: orderedModels },
});
```

## 常见问题

### 只出现在边中的节点不在 `$nodes` 里

```typescript
import { dsl, fromDot } from 'ts-graphviz';

const g = dsl(fromDot('digraph { a; a -> b; }'));
console.log(g.$nodes.map((n) => n.$id)); // ['a']
console.log(g.$getNode('b')); // undefined
```

在 DOT 中，边会创建它所提到的节点。但模型只按 id 记录边的端点：`$nodes`（以及模型的 `nodes`）保存的是以节点语句写出的节点，而不是 Graphviz 意义上图的全部节点。一个节点可能属于多个子图，子图里的 `a -> b` 也可能指向写在子图外的节点，因此模型不做推测。要让节点出现在 `$nodes` 中，请用 `g.node('b')` 声明它，或者读取边端点的 id。

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

### 使用有序模型时，`$attributes.node` 只表示最初的默认值

使用 `ts-graphviz/ordered` 时，写在其他语句之后的默认属性语句是图中独立的一条语句。`g.$attributes.node` 是图开头的默认值，而不是最后写的 `node [...]`：

```typescript
import { digraph } from 'ts-graphviz/ordered';

digraph((g) => {
  g.node({ color: 'red' });
  g.node('a');
  g.node({ color: 'blue' });
  console.log(g.$attributes.node.color); // 'red'
});
```

出于同样的原因，在后面的语句中指定 `undefined` 不会删除前面语句设置的值。
