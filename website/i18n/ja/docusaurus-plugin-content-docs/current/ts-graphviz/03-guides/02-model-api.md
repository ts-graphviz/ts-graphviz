---
description: DOT Object Model（DOM）を使い、グラフをデータとして組み立て、読み取り、変換します。
---
# DOT Object Model（DOM）

名前は Web ブラウザーの DOM にならっていますが、イベント、セレクター、ライブコレクションはありません。

**DOT Object Model（DOM）** は、グラフを構成するオブジェクトの集まりです。`Digraph` / `Graph`、`Subgraph`、`Node`、`Edge`、既定属性の文、コメントがあります。[DOT DSL](./01-dot-dsl.md) が DOT と同じようにグラフを書くためのものであるのに対し、DOM は、他のデータからグラフを組み立てたり、グラフを読み取ったり変換したり、独自のクラスを定義したりするプログラムのためのものです。

DSL はそれぞれ DOM の一つのモデルの代わりです。`modelOf(dsl)` でモデルを、`dsl(model)` でモデルの DSL を得られます。どちらも同じグラフを扱います。

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
| `graphId`、`subgraphId`、`nodeId` | ルートグラフ、サブグラフ、ノードの名前（DOT での ID） |
| `nodes`、`edges`、`subgraphs` | グラフのノード、エッジ、サブグラフ。`nodes` が持つのはノード文で、エッジにだけ出てくるノードは含みません（[よくある質問](./01-dot-dsl.md#エッジにだけ出てくるノードが-nodes-に入らない)を参照） |
| `statements` | グラフのノード、エッジ、サブグラフ、先頭以外の既定属性の文を追加した順に並べたもの。`toDot` はこの順に書き出します。グラフ自身の属性と先頭の既定値はその前に書き出されます |
| `getNode(id)`、`getSubgraph(id)` | id でノードやサブグラフを得る |
| `existNode(id)`、`existEdge(edge)`、`existSubgraph(subgraph)` | グラフにあるかどうか |
| `removeNode(nodeOrId)`、`removeEdge(edge)`、`removeSubgraph(subgraph)` | 取り除く |
| `addAttributeList(kind, attributes)` | 既定属性の文（`node [...]` など）をその位置に追加して返す |

`removeNode` が取り除くのはノード文だけです。そのノードへのエッジは残り、Graphviz はエッジを描くときにノードを作り直します。ノードを消したい場合は、エッジも取り除いてください。

```typescript
import { fromDot } from 'ts-graphviz';

const g = fromDot('digraph { a; a -> b; }');
for (const edge of g.edges) {
  if (edge.targets.some((t) => 'id' in t && t.id === 'a')) g.removeEdge(edge);
}
g.removeNode('a');
```

## 属性

グラフ、サブグラフ、ノード、エッジ、既定属性の文は、自分で属性を持ち、DOM の `Element` と同じ名前のメソッドで扱います。

| メソッド | |
| --- | --- |
| `getAttribute(name)` | 値、または `undefined` |
| `setAttribute(name, value)` | 一つ設定する |
| `removeAttribute(name)` | 一つ削除する |
| `hasAttribute(name)` | 設定されているかどうか |
| `getAttributeNames()` | 設定されている名前（順序どおり） |
| `setAttributes(attributes)` | オブジェクトかエントリーから複数設定する |
| `removeAttributes()` | すべて削除する |

```typescript
import { fromDot } from 'ts-graphviz';

const g = fromDot('digraph { a [label = "A"]; a -> b; }');
const a = g.getNode('a');
a?.setAttribute('color', 'red');
console.log(a?.getAttribute('label')); // 'A'
console.log(a?.getAttributeNames()); // ['label', 'color']
console.log(g.statements.map((s) => s.$$type)); // ['Node', 'Edge']
```

3.x の名前（`get`、`set`、`delete`、`apply`、`clear`、`values`、`size`、ノードやエッジの `attributes`）は、v5 まで非推奨のまま使えます。

## 既定属性の文

DOT と同じく、既定属性の文はその後に書いたものにだけ適用されます。`addAttributeList` は既定属性の文を追加してそのリストを返すので、取っておけば後からその既定値を変更できます。

```typescript
import { Digraph, toDot } from 'ts-graphviz';

const g = new Digraph();
g.createNode('a');
const defaults = g.addAttributeList('Node', { shape: 'box' }); // 後に書いたものに適用される
g.createNode('b');
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

他のどの文よりも前に追加した文は、先頭の既定値に加わります。`attributes`（`attributes.node` など）は非推奨です。これは先頭の既定値だけを指します。

## コメント

どのモデルもコメントを持てます。`addComment(text, { position, kind })` はコメントを追加して返し、`comments` で一覧を得て、`removeComment(comment)` で取り除けます。コメントは凍結された `CommentModel` で、`text`、`kind`（`'Slash'`、`'Block'`、`'Macro'`、または `fromModel` の `commentKind` オプションに従う `undefined`）、`position`（`'leading'`、`'trailing'`、グラフやサブグラフでは `'end'`）を持ちます。

```typescript
import { Digraph, toDot } from 'ts-graphviz';

const g = new Digraph('G');
const a = g.createNode('a');
a.addComment('hello');
console.log(a.comments.map((c) => [c.text, c.position])); // [['hello', 'leading']]

console.log(toDot(g));
// digraph "G" {
//   // hello
//   "a";
// }
```

`fromDot` はソースのコメントを種類と位置ごと保ち、`toDot` は同じ位置に書き戻します。モデルの `comment` は非推奨で、最初の先頭コメントを読み書きします。

## モデルの型ガード

`isNodeModel`、`isEdgeModel`、`isSubgraphModel`、`isRootGraphModel`、`isAttributeListModel`、`isDotModel`、`isCommentModel` は、値が何であるかを判定します。DSL はモデルではないため、これらは DSL に対して false を返します。`modelOf(x)` か `$$type` で確かめてください。

```typescript
import { digraph, isNodeModel, modelOf } from 'ts-graphviz';

const G = digraph((g) => {
  g.node('a');
});

const nodes = modelOf(G).statements.filter(isNodeModel);
console.log(nodes.length); // 1
```

## モデルコンテキスト

モデルコンテキストは、グラフが中身を作るときに使うクラスの組です。`withContext(models)` はそのコンテキストのファクトリー（`digraph`、`graph`、`strict`）を返し、`graph.with(models)` はグラフのコンテキストを設定し、`fromDot` と `fromDotAll` は `convert.models` で受け取ります。指定しなかったクラスは、`withContext` と `fromDot` では既定のクラス、`graph.with` ではそのグラフが今使っているクラスのままです。

```typescript
import { Node, withContext } from 'ts-graphviz';

class MyNode extends Node {}

const { digraph } = withContext({ Node: MyNode });
digraph((g) => {
  g.node('a'); // MyNode の DSL
});
```

`legacyModels`（`LegacyGraph`、`LegacyDigraph`、`LegacySubgraph`）は 3.x のクラスで、既定属性の文をすべてグラフごとに一組の既定値にまとめます。`ts-graphviz/legacy` はすべてのファクトリーでこれを使います（[DOT の文の順序](./01-dot-dsl.md#dot-の文の順序)を参照）。これらは非推奨で、v5 で削除されます。

独自クラス、型付きのコンテキスト、型の拡張については、[ts-graphvizの拡張](./05-extending-ts-graphviz.md)を参照してください。
