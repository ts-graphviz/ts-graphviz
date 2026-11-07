---
description: モデル API を使い、グラフをデータとして組み立て、読み取り、変換します。
---
# モデル API の使い方

モデルは、グラフを構成するデータです。`Digraph` / `Graph`、`Subgraph`、`Node`、`Edge`、既定属性のリストがあります。[DOT DSL](./01-dot-dsl.md) が DOT と同じようにグラフを書くためのものであるのに対し、モデル API は、他のデータからグラフを組み立てたり、グラフを読み取ったり変換したり、独自のクラスを定義したりするプログラムのためのものです。

DSL はそれぞれ一つのモデルの代わりです。`modelOf(dsl)` でモデルを、`dsl(model)` でモデルの DSL を得られます。どちらの API も同じグラフを扱います。

## グラフを組み立てる

グラフは `createNode`、`createEdge`、`createSubgraph` で中身を作ります。作るときには、そのグラフのモデルコンテキストのクラスが使われます。

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

単独で作ったモデルは `addNode`、`addEdge`、`addSubgraph` で追加します。

```typescript
import { Digraph, Edge, Node } from 'ts-graphviz';

const g = new Digraph();
const a = new Node('a');
const b = new Node('b');
g.addNode(a);
g.addNode(b);
g.addEdge(new Edge([a, b]));
```

## グラフを読み取り、変更する

| メンバー | |
| --- | --- |
| `nodes`、`edges`、`subgraphs` | グラフのノード、エッジ、サブグラフ |
| `statements` | 追加した順の中身。`toDot` はこの順に書き出します |
| `getNode(id)`、`getSubgraph(id)` | id でノードやサブグラフを得る |
| `existNode(id)`、`existEdge(edge)`、`existSubgraph(subgraph)` | グラフにあるかどうか |
| `removeNode(nodeOrId)`、`removeEdge(edge)`、`removeSubgraph(subgraph)` | 取り除く |
| `get(key)`、`set(key, value)`、`apply(attributes)`、`delete(key)` | グラフ自身の属性 |
| `attributes.node`、`attributes.edge`、`attributes.graph` | 既定属性のリスト（`node [...]` など） |
| `addAttributeList(kind, attributes)` | 既定属性の文を追加する |

ノードとエッジの属性は `attributes` にあります。

```typescript
import { fromDot } from 'ts-graphviz';

const g = fromDot('digraph { a [label = "A"]; a -> b; }');
const a = g.getNode('a');
a?.attributes.set('color', 'red');
console.log(a?.attributes.get('label')); // 'A'
console.log(g.statements.map((s) => s.$$type)); // ['Node', 'Edge']
g.removeNode('a');
```

## モデルの型ガード

`isNodeModel`、`isEdgeModel`、`isSubgraphModel`、`isRootGraphModel`、`isAttributeListModel`、`isDotModel` は、値が何であるかを判定します。DSL はモデルではないため、これらは DSL に対して false を返します。`modelOf(x)` か `$$type` で確かめてください。

```typescript
import { digraph, isNodeModel, modelOf } from 'ts-graphviz';

const G = digraph((g) => {
  g.node('a');
});

const nodes = modelOf(G).statements.filter(isNodeModel);
console.log(nodes.length); // 1
```

## モデルコンテキスト

モデルコンテキストは、グラフが中身を作るときに使うクラスの組です。`withContext(models)` はそのコンテキストのファクトリー（`digraph`、`graph`、`strict`）を返し、`graph.with(models)` はグラフのコンテキストを設定し、`fromDot` と `fromDotAll` は `convert.models` で受け取ります。指定しなかったクラスは既定のままです。

```typescript
import { Node, withContext } from 'ts-graphviz';

class MyNode extends Node {}

const { digraph } = withContext({ Node: MyNode });
digraph((g) => {
  g.node('a'); // the DSL of a MyNode
});
```

`orderedModels` は、既定属性の文を DOT と同じように書いた位置に残すグラフのモデルコンテキストです。`ts-graphviz/ordered` はすべてのファクトリーでこれを使います（[DOT の文の順序](./01-dot-dsl.md#dot-の文の順序)を参照）。

独自クラス、型付きのコンテキスト、型の拡張については、[ts-graphvizの拡張](./05-extending-ts-graphviz.md)を参照してください。
