---
description: グラフを構築・操作するための ts-graphviz の基本を理解しましょう
---

# 基本的な概念と使い方

このセクションでは、`ts-graphviz` の基本的な概念と、それを使用してグラフを構築する方法について説明します。

## ノードの作成

ノードはグラフの基本単位であり、エンティティやオブジェクトを表します。

```typescript
g.node('Node1', { label: 'ノード 1', color: 'red' });
```

**解説:**

- **ノード識別子**: `'Node1'` はノードの一意な識別子です。
- **属性**: `label` や `color` などの属性を指定して、ノードの外観をカスタマイズできます。

**属性の例:**

- `label`: ノードに表示されるテキスト。
- `color`: ノードの色。
- `shape`: ノードの形状（例：`box`、`circle`、`diamond`）。

**詳細情報:**

- ノードで使用できるすべての属性については、[Graphviz のノードに関するドキュメント](https://graphviz.org/docs/nodes/)および[属性の一覧](https://graphviz.org/doc/info/attrs.html)を参照してください。

## エッジの作成

エッジはノード間の関係や接続を表します。

```typescript
g.edge(['Node1', 'Node2'], { label: 'エッジラベル', color: 'blue' });
```

**解説:**

- **ノードの接続**: `['Node1', 'Node2']` を使用してノード間のエッジを定義します。
- **属性**: エッジに対して `label` や `color` などの属性を指定できます。

**属性の例:**

- `label`: エッジに表示されるテキスト。
- `color`: エッジの色。
- `style`: エッジのスタイル（例：`dashed`、`bold`）。

**詳細情報:**

- エッジで使用できるすべての属性については、[Graphviz のエッジに関するドキュメント](https://graphviz.org/docs/edges/)および[属性の一覧](https://graphviz.org/doc/info/attrs.html)を参照してください。

## サブグラフの使用

サブグラフを使用すると、ノードやエッジをグループ化できます。これは、クラスターを作成したり、レイアウトを制御したりする際によく使われます。

```typescript
g.subgraph('ClusterA', { label: 'クラスター A' }, (cluster) => {
  cluster.node('A1');
  cluster.node('A2');
  cluster.edge(['A1', 'A2']);
});
```

**解説:**

- **サブグラフの作成**: `subgraph` メソッドを使用して `'ClusterA'` という名前のサブグラフを作成します。
- **サブグラフの属性**: `label` などの属性を設定して、サブグラフに名前を付けます。
- **ノードとエッジの追加**: コールバック関数内でノードとエッジを定義します。

**詳細情報:**

- サブグラフの詳細については、[Graphviz のサブグラフに関するドキュメント](https://graphviz.org/docs/subgraphs/)を参照してください。

---

## まとめ

**例:**

```typescript
import { digraph } from 'ts-graphviz';

const g = digraph('G', { newrank: true }, (g) => {
  g.node('Node1', { label: 'ノード 1', color: 'red' });
  g.node('Node2', { label: 'ノード 2', color: 'green' });

  g.edge(['Node1', 'Node2'], { label: 'エッジラベル', color: 'blue' });

  g.subgraph('ClusterA', { label: 'クラスター A', color: 'lightgrey' }, (cluster) => {
    cluster.node('A1', { shape: 'box' });
    cluster.node('A2', { shape: 'ellipse' });
    cluster.edge(['A1', 'A2'], { style: 'dashed' });
  });
});
```

**ビジュアル表現:**

![基本的な使い方](./img/basic-usage.svg)

---

## さらなる情報

ノード、エッジ、グラフで使用可能な属性やその使い方について、詳細な情報は公式の Graphviz ドキュメントを参照してください。

- [Graphviz 属性の一覧](https://graphviz.org/doc/info/attrs.html)
- [ノード属性](https://graphviz.org/doc/info/attrs.html#d:node)
- [エッジ属性](https://graphviz.org/doc/info/attrs.html#d:edge)
- [グラフ属性](https://graphviz.org/doc/info/attrs.html#d:graph)

これらのリソースは、ノード、エッジ、グラフに適用できる属性の包括的なリストを提供しており、視覚化をカスタマイズするのに役立ちます。
