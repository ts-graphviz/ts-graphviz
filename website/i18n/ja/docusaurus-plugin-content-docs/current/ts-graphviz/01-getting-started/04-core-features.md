---
description: グラフ作成と操作のためのts-graphvizの主要なAPIを紹介
---

# コア機能

## TypeScript フレンドリーな API

`ts-graphviz` は TypeScript とシームレスに統合された API を提供し、強力な型定義と完全な IntelliSense サポートを備えています。これにより、開発中のエラーをより簡単に発見でき、開発者の体験が向上します。

```ts ts-graphviz:read-only
import { digraph, attribute as _ } from 'ts-graphviz';

const G = digraph('G', (g) => {
  g.node('A', { [_.color]: 'red' });
  g.edge(['A', 'B'], { [_.label]: 'A to B' });
});
```

:::tip
`digraph` や `g.node`、`[_.color]` にカーソルを合わせると型のヒントが表示されます。
:::

**解説:**

- **強力な型付け**：TypeScript の型システムにより、正しい型が使用されていることを保証し、エラーを防止します。
- **IntelliSense のサポート**：Visual Studio Code などのコードエディタで自動補完やドキュメントのヒントが利用できます。

### オブジェクト指向モデル

DOT DSL に加えて、`ts-graphviz` はグラフ要素を表現するモデルクラスを提供するオブジェクト指向の API も提供しています。このアプローチは TypeScript のクラスベースの機能を活用し、より明示的で細かな制御を可能にします。

**モデルクラス:**

- `Graph` / `Digraph`：グラフ全体を表します。
- `Subgraph`：サブグラフやクラスターを表します。
- `Node`：グラフ内のノードを表します。
- `Edge`：ノード間のエッジを表します。

**例:**

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

**解説:**

- **クラスのインスタンス化**：`Node`、`Edge`、`Digraph` のインスタンスを作成してグラフを構築します。
- **グラフへの要素の追加**：`addNode` と `addEdge` メソッドを使用してグラフに要素を追加します。
- **明示的な制御**：各要素を個別に直接操作できます。

**オブジェクト指向アプローチの利点:**

- **明示的な制御**：グラフ要素に対して細かな制御が可能です。
- **拡張性**：クラスを拡張してカスタムな動作や属性を作成できます。
- **TypeScript との整合性**：TypeScript のオブジェクト指向機能を活用し、これらの概念に精通した開発者にとって直感的です。

---

## 2 つの API：DOT DSL とモデル

`ts-graphviz` には、グラフを扱う方法が 2 つあります。どちらも同じグラフを扱います。

- **DOT DSL**：ファクトリー（`digraph`、`graph`、`strict.digraph`、`strict.graph`）が返すものです。DOT の文がメソッドに、属性がプロパティになっていて、DOT と同じようにグラフを書けます。[DOT DSL でグラフを書く](../03-guides/01-dot-dsl.md)を参照してください。
- **モデル API**：クラス（`Digraph`、`Node`、`Edge` など）とそのメソッドです。グラフをデータとして組み立てたり、読み取ったり、変換したりするプログラムや、独自のクラスを定義する場合に使います。[モデル API の使い方](../03-guides/02-model-api.md)を参照してください。

```typescript
import { digraph, modelOf, toDot } from 'ts-graphviz';

const G = digraph('G', (g) => {
  g.rankdir = 'LR'; // rankdir = "LR";
  const a = g.node('A', { label: 'Start' }); // "A" [label = "Start";];
  g.edge([a, 'B']); // "A" -> "B";
});

toDot(G); // DSL でもそのモデルでもよい
modelOf(G).createNode('C'); // DSL の元になっているモデル
```
