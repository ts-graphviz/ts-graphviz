---
description: ts-graphvizの高度なユースケース向けの拡張方法
---
# ts-graphvizの拡張

`ts-graphviz` は拡張性を考慮して設計されており、中級ユーザーが特定のニーズに応じてライブラリの機能をカスタマイズおよび強化することができます。
このセクションでは、型システムの拡張方法とカスタム実装の作成方法について説明します。

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

### モデルコンテキスト API (`with` メソッド)

**モデルコンテキスト API** を使用して、グラフ内で生成されるオブジェクトのカスタムクラスを作成することもできます。
`Digraph`、`Graph`、および `Subgraph` の `with` メソッドを使用すると、カスタムモデルを事前に定義できます。

```typescript
const g = new Digraph();
g.with({
  Node: MyCustomNode,
  Edge: MyCustomEdge,
});

const a = g.createNode('A'); // MyCustomNode のインスタンス
const b = g.createNode('B'); // MyCustomNode のインスタンス
g.createEdge([a, b]);        // MyCustomEdge のインスタンス

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

### `$` 記号を用いたカスタマイズ

カスタマイズを可能にするため、拡張を意図した型は `$` 記号で名前付けされています。以下にリストされていない型定義を拡張する必要がある場合は、`$...` を用いて拡張できるかソースコードを確認してください。できない場合は、issue またはプルリクエストを作成してください。

### ユースケース

#### カスタムグラフレイアウトおよび出力フォーマットの指定

`@ts-graphviz/adapter` の型を拡張することで、カスタムレイアウトアルゴリズムや出力フォーマットを指定できます。以下はその方法です。

```typescript
import { $keywords } from '@ts-graphviz/common';
import { toFile } from '@ts-graphviz/adapter';

// 1. '@ts-graphviz/adapter' モジュールを宣言します。
declare module '@ts-graphviz/adapter' {
  export namespace Layout {
    // 2. Layout 名前空間内に $values インターフェースを定義します。
    // 3. $keywords を継承し、カスタムレイアウトアルゴリズムの名前を追加します。
    export interface $values extends $keywords<'my-custom-algorithm'> {}
  }

  export namespace Format {
    // 4. Format 名前空間内に $values インターフェースを定義します。
    // 5. $keywords を継承し、カスタム出力フォーマットの名前を追加します。
    export interface $values extends $keywords<'mp4'> {}
  }
}

// これでカスタムレイアウトとフォーマットを使用できます。
toFile('digraph { a -> b }', '/path/to/file', {
  layout: 'my-custom-algorithm',
  format: 'mp4',
});
```

#### カスタム属性の追加

`@ts-graphviz/common` の型を拡張することで、カスタム属性を追加できます。

```typescript
import { $keywords } from '@ts-graphviz/common';
import { digraph, toDot, attribute as _ } from 'ts-graphviz';

// 1. '@ts-graphviz/common' モジュールを宣言します。
declare module '@ts-graphviz/common' {
  export namespace GraphAttributeKey {
    // 2. GraphAttributeKey 名前空間内に $values インターフェースを定義します。
    // 3. $keywords を継承し、カスタム属性の名前を追加します。
    export interface $values extends $keywords<'hoge'> {}
  }

  export namespace Attribute {
    // 4. Attribute 名前空間内に $keys インターフェースを定義します。
    // 5. $keywords を継承し、カスタム属性の名前を追加します。
    export interface $keys extends $keywords<'hoge'> {}

    // 6. Attribute 名前空間内に $types インターフェースを定義します。
    // 7. カスタム属性の型を指定します。
    export interface $types {
      hoge: string;
    }
  }
}

// これでカスタム属性を使用できます。
console.log(
  toDot(
    digraph((g) => {
      g.set(_.hoge, 'fuga');
    }),
  ),
);
```

---

## 内部パッケージの概要

`ts-graphviz` を拡張またはカスタマイズするユーザーにとって、内部パッケージを理解することは有益です。以下に、内部パッケージの概要と高度なシナリオでの使用方法を示します。

### `@ts-graphviz/adapter`

**目的**: Graphviz コマンドを実行し、DOT 言語の文字列をさまざまな出力フォーマットに変換するためのインターフェースを提供します。

**使用方法**:

- DOT 文字列をストリームやファイルに変換する。
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
