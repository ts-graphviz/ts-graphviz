---
description: ts-graphvizの高度なユースケース向けの拡張方法
---
# ts-graphvizの拡張

`ts-graphviz` は拡張性を考慮して設計されており、中級ユーザーが特定のニーズに応じてライブラリの機能をカスタマイズおよび強化することができます。
このセクションでは、型システムの拡張方法とカスタム実装の作成方法について説明します。
モデルそのものについては、[DOT Object Model（DOM）](./02-model-api.md)を参照してください。

## カスタムクラスの作成

既存のクラスを継承することで独自の実装を追加できます。
これにより、グラフ要素に対してカスタムの動作やデフォルト属性を定義することが可能になります。

```typescript
import { Digraph, Node, Edge, EdgeTargetTuple, attribute as _, toDot } from 'ts-graphviz';

class MyCustomDigraph extends Digraph {
  constructor() {
    super('G', {
      [_.label]: 'これはカスタム有向グラフです',
    });
  }
}

class MyCustomNode extends Node {
  constructor(id: string) {
    super(`node_${id}`, {
      [_.label]: `これはカスタムノード ${id} です`,
    });
  }
}

class MyCustomEdge extends Edge {
  constructor(targets: EdgeTargetTuple) {
    super(targets, {
      [_.label]: 'これはカスタムエッジです',
    });
  }
}

const digraph = new MyCustomDigraph();
const node1 = new MyCustomNode('A');
const node2 = new MyCustomNode('B');
const edge = new MyCustomEdge([node1, node2]);
digraph.addNode(node1);
digraph.addNode(node2);
digraph.addEdge(edge);

const dot = toDot(digraph);
console.log(dot);
/* 出力:
digraph "G" {
  label = "これはカスタム有向グラフです";
  "node_A" [
    label = "これはカスタムノード A です";
  ];
  "node_B" [
    label = "これはカスタムノード B です";
  ];
  "node_A" -> "node_B" [
    label = "これはカスタムエッジです";
  ];
}
*/
```

### カスタムクラスのキット (`createModelKit`)

モデルキットは、渡したクラスからモデルを作ります。`createModelKit` はカスタムクラスを受け取り、残りには既定のクラスを使います。

```typescript
import {
  createModelKit,
  Node,
  Edge,
  type EdgeAttributesObject,
  type EdgeTargetTuple,
  type NodeAttributesObject,
  attribute as _,
  toDot,
} from 'ts-graphviz';

class MyCustomNode extends Node {
  constructor(id: string, attributes?: NodeAttributesObject) {
    super(`node_${id}`, {
      [_.label]: `これはカスタムノード ${id} です`,
      ...attributes,
    });
  }
}

class MyCustomEdge extends Edge {
  constructor(targets: EdgeTargetTuple, attributes?: EdgeAttributesObject) {
    super(targets, {
      [_.label]: 'これはカスタムエッジです',
      ...attributes,
    });
  }
}

const kit = createModelKit({
  Node: MyCustomNode,
  Edge: MyCustomEdge,
});

const g = kit.createDigraph();
const a = kit.createNode('A'); // MyCustomNode のインスタンス
const b = kit.createNode('B'); // MyCustomNode のインスタンス
g.addNode(a);
g.addNode(b);
g.addEdge(kit.createEdge([a, b])); // MyCustomEdge のインスタンス

const dot = toDot(g);
console.log(dot);
/* 出力:
digraph {
  "node_A" [
    label = "これはカスタムノード A です";
  ];
  "node_B" [
    label = "これはカスタムノード B です";
  ];
  "node_A" -> "node_B" [
    label = "これはカスタムエッジです";
  ];
}
*/
```

## 型システムの拡張

`ts-graphviz` を使用すると、ライブラリの型システムを拡張してグラフ視覚化ソリューションをカスタマイズできます。これは、カスタムグラフレイアウト、出力フォーマット、またはデフォルトではサポートされていないカスタム属性を指定する必要がある場合に役立ちます。

### 独自の型

独自の属性や値の型、Graphviz のプラグインが追加するレイアウトエンジンや出力フォーマットは、スキーマ（`defineSchema`）に列挙します。属性は 1 つのキットのモデルを、フォーマットとレイアウトはそのスキーマを渡したアダプターの呼び出しを型付けします。プログラム全体の型は変わりません。宣言のマージ（`declare module '@ts-graphviz/common'`）で型を拡張することはできません。

### ユースケース

#### カスタムグラフレイアウトおよび出力フォーマットの指定

Graphviz のプラグインが追加するレイアウトエンジンと出力フォーマットは、スキーマの `types.layout` と `types.format` に名前とともに（`values.extend('mp4')`）列挙し、そのスキーマをアダプターの `schema` オプションに渡します。スキーマは `dotCommand` と同じく信頼された設定です。コードで定義し、エンドユーザーの入力から作らないでください。リクエストから来た `format` や `layout` は、ドキュメントにある名前だけと照合されます（`isFormat` / `isLayout`）。

```typescript
import { toBlob } from '@ts-graphviz/adapter';
import { defineSchema, values } from '@ts-graphviz/common';

// Graphviz のプラグインが追加するレイアウトエンジンと出力フォーマットを
// スキーマに列挙します。`schema` に渡すと、その呼び出しに限って実行時に
// 受け付けられ、`layout` と `format` の型も広がります。グローバルには何も
// 変わらず、`isFormat` / `isLayout` が true を返すのは、ドキュメントにある
// 名前だけのままです。
const schema = defineSchema({
  types: {
    layout: values.extend('my-custom-algorithm'),
    format: values.extend('mp4'),
  },
});
const video = await toBlob('digraph { a -> b }', {
  schema,
  layout: 'my-custom-algorithm',
  format: 'mp4',
  // sanitize は確認していないフォーマットを拒否するため無効にする
  sanitize: false,
});
```

#### カスタム属性の追加

スキーマには、キットのモデルが組み込みのものに加えて（または代わりに）受け付ける属性と値の型を列挙します。

```typescript
import { attr, defineSchema, toDot, values, withModelKit } from 'ts-graphviz';

// 組み込みのもの以外にグラフが受け付ける属性と値の型。
const schema = defineSchema({
  graph: { hoge: attr<string>() }, // 新しい属性
  node: {
    'data-id': attr<number>(),
    label: attr.override<number>(), // 組み込みの型ではなく数値
  },
  types: { color: values.extend<'brand-blue'>() }, // color 型のすべての属性
});

const { digraph } = withModelKit({ schema });
console.log(
  toDot(
    digraph((g) => {
      g.hoge = 'fuga';
      g.node('a', { 'data-id': 1, label: 2, color: 'brand-blue' });
    }),
  ),
);
```

- `attr<T>()` は属性を追加します。`attr.extend<T>()`（組み込みの型か `T`）と `attr.override<T>()`（`T` に置き換え）は組み込みの属性を変更します。各エントリは型を指定し、どちらを適用するかを必ず明示します。組み込みの属性に `attr<T>()` を使うと型エラーになります。
- `types` は値の型（`color`、`style`、`shape`、`arrowType` など）を `values.extend<T>()` または `values.override<T>()` で変更し、その型を使うすべての属性に反映します。
- 種類は `graph`、`subgraph`、`cluster`、`node`、`edge` です。
- スキーマで型付けされるのはそのキットのモデルだけです：`withModelKit({ schema })`、`createModelKit({ schema, Node: MyNode })`（`class MyNode extends Node<typeof schema> {}` とともに）、`fromDot(dot, { convert: { models: { schema } } })`。ライブラリのグラフなど、ほかのグラフは変わりません。

---

## 内部パッケージの概要

`ts-graphviz` を拡張またはカスタマイズするユーザーにとって、内部パッケージを理解することは有益です。以下に、内部パッケージの概要と高度なシナリオでの使用方法を示します。

### `@ts-graphviz/adapter`

**目的**: Graphviz コマンドを実行し、DOT 言語の文字列をさまざまな出力フォーマットに変換するためのインターフェースを提供します。

**使用方法**:

- `toBlob` で DOT 文字列をレンダリングし、`Blob` として受け取る。
- グラフを画像や他のフォーマットにレンダリングする必要がある環境で使用する。

:::note
`@ts-graphviz/adapter` または `ts-graphviz/adapter` のいずれかのインポートを使用できます。後者は後方互換性のために維持されています。
:::

### `@ts-graphviz/ast`

**目的**: 抽象構文木（AST）レベルで DOT 言語を操作することを可能にします。

**使用方法**:

- DOT 文字列を AST ノードにパースする。
- AST をプログラム的に操作および変換する。
- 既存の DOT コードの高度な分析や変換に役立ちます。

:::note
`@ts-graphviz/ast` または `ts-graphviz/ast` のいずれかのインポートを使用できます。後者は後方互換性のために維持されています。
:::

### `@ts-graphviz/common`

**目的**: Graphviz のドメイン知識を集約し、型定義、定数、およびユーティリティを提供します。型の拡張などのユースケースを処理するために設計されています。

**使用方法**:

- 型や属性を拡張またはカスタマイズする。
- カスタム属性を扱う際に型安全性を確保する。
- パッケージ全体で一貫した使用を保証するために、Graphviz のドメイン知識を集約する。

### `@ts-graphviz/core`

**目的**: ユーザーに提供されるモデルおよび関数のコア実装を含みます。

**使用方法**:

- グラフ要素を細かく制御するためのオブジェクト指向APIを使用する。
- カスタムの動作や属性を追加するためにクラスを拡張する。
