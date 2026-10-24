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

宣言的なスタイルに加えて、`ts-graphviz` はグラフ要素を表現するモデルクラスを提供するオブジェクト指向の API も提供しています。このアプローチは TypeScript のクラスベースの機能を活用し、より明示的で細かな制御を可能にします。

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

## API の理解：宣言的 vs 命令的

`ts-graphviz` に慣れてくると、グラフを構築するための2つの主要なスタイル、**宣言的** と **命令的** API に出会うでしょう。

### 宣言的 API

宣言的 API は、グラフを簡潔かつ読みやすく定義する方法を提供します。`node`、`edge`、`subgraph` などのメソッドをコールバック関数内で使用して、グラフの構造を構築します。

**例:**

```typescript
import { digraph } from 'ts-graphviz';

const G = digraph('G', (g) => {
  g.node('A');
  g.node('B');
  g.edge(['A', 'B']);
});
```

**解説:**

- **グラフファクトリ関数**：`digraph` 関数は新しいグラフを作成し、コンテキスト `g` を提供します。
- **要素の追加**：コンテキスト内で `g.node` と `g.edge` を使用してノードとエッジを追加します。
- **可読性**：構造がグラフの論理構造を反映しており、読みやすくなっています。

### 命令的 API

命令的 API は、グラフ要素の作成と操作に対して明示的な制御を提供します。オブジェクト指向のメソッドを使用して、ステップバイステップでグラフを構築します。

**例:**

```typescript
import { Digraph } from 'ts-graphviz';

const G = new Digraph('G');

const nodeA = G.createNode('A');
const nodeB = G.createNode('B');
G.createEdge([nodeA, nodeB]);
```

**解説:**

- **グラフのインスタンス化**：新しい `Digraph` インスタンスを作成します。
- **ノードとエッジの作成**：`createNode` と `createEdge` メソッドを使用して要素を明示的に追加します。
- **明示的な制御**：このスタイルでは、作成プロセスに対してより多くの制御が可能です。

**適切な API の選択**

- **宣言的 API**：少ないコードでグラフの構造を素早く定義したい場合に最適です。
- **命令的 API**：グラフ要素の作成と操作に対して明示的な制御が必要な場合に便利です。
