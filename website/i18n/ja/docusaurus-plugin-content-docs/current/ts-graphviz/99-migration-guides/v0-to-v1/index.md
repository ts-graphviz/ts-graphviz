---
description: |-
  包括的なマイグレーションガイドで ts-graphviz を v0 から v1 へアップグレードしましょう。AST 中心の設計への移行、インターフェースの名称変更、コードの更新方法を学び、パフォーマンスと型安全性を向上させましょう。
---
# v0 から v1 への移行

## 変更点の概要

ts-graphviz v0 から v1 への移行では、ライブラリのアーキテクチャと API に大きな変更が加えられました：

- **AST 中心の設計への移行**：AST（抽象構文木）に関連するモジュールが統合され、モデルを DOT 言語に変換する機能が一箇所に集約されました。
- **`ts-graphviz/ast` モジュールの導入**：`@ts-graphviz/parser` パッケージが統合され、`ts-graphviz/ast` モジュールとして AST 関連の処理（`parse` や `stringify` 関数など）が提供されるようになりました。
- **属性型の導入**：さまざまな属性の型定義が追加され、属性指定時のエディタ補完や TypeScript の型チェックが強化されました。
- **インターフェースの命名規則の統一**：インターフェース名の曖昧さが解消され、`ICluster` などの `I` で始まるインターフェース名が、AST 型と整合性のある名前に変更されました。

## なぜアップグレードするのか

v1 へのアップグレードによる利点：

- **AST 処理の統一**：AST モジュールの統合により、グラフの操作が簡潔かつ効率的になりました。
- **型安全性の向上**：属性型の導入により、型チェックが強化され、開発体験が向上します。
- **命名の一貫性**：新しい命名規則により、ライブラリの理解と使用が容易になります。

## マイグレーション手順


### 1. 依存関係の更新

`ts-graphviz` パッケージをバージョン 1 に更新します。

```json
{
  "dependencies": {
    "ts-graphviz": "^1.0.0"
  }
}
```

以下のコマンドを実行します：

```sh
npm install ts-graphviz@^1.0.0
```

### 2. インターフェース名の更新

インターフェース名が変更されました。コードを以下のように更新してください：

- `INode` ➔ `NodeModel`
- `IEdge` ➔ `EdgeModel`
- `ICluster` ➔ `GraphBaseModel`（推奨は `GraphModel` または `SubgraphModel`）
- `ISubgraph` ➔ `SubgraphModel`
- `IRootCluster` ➔ `RootGraphModel`

**例：**

```diff
- import { INode } from 'ts-graphviz';
+ import { NodeModel } from 'ts-graphviz';

- const node: INode = ...;
+ const node: NodeModel = ...;
```

### 3. 新しい `ts-graphviz/ast` モジュールの使用

`@ts-graphviz/parser` を使用していた場合、新しい `ts-graphviz/ast` モジュールに移行してください。

**例：**

```diff
- import { parse, stringify } from '@ts-graphviz/parser';
+ import { parse, stringify } from 'ts-graphviz/ast';

const dot = 'digraph { a -> b }';
const ast = parse(dot);
// AST を操作...
const newDot = stringify(ast);
```

### 4. 属性の使用方法の更新

属性型が導入されたことで、特定の属性キーと値をインポートできるようになりました。

**例：**

```typescript
import { attribute } from 'ts-graphviz';

g.node('Node1', {
  [attribute.label]: '私のノード',
  [attribute.color]: 'red',
});
```
