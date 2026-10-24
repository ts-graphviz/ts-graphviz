---
description: |-
  最新のマイグレーションガイドで ts-graphviz を v1 から v2 へアップグレードしましょう。最新の改善点や Node.js バージョンの更新について学び、最小限の変更で互換性を維持する方法を確認してください。インポートパスや依存関係をほとんど変更せずにプロジェクトを更新する方法をご紹介します。
---
# v1 から v2 への移行

## 変更点の概要

ts-graphviz のバージョン 2 では、以下の大きな変更が導入されました：

- **パッケージの分割とモノレポ化**：ライブラリが複数のパッケージに分割され、モジュール性と保守性が向上しました。しかし、互換性を維持するために、`ts-graphviz` パッケージ内で `ts-graphviz/adapter` や `ts-graphviz/ast` モジュールを引き続き利用できます。
- **Node.js 14 & 16 のサポート終了**：最低動作環境が **Node.js 18** になりました。
- **開発ツールの更新**：パッケージ管理に `pnpm`、ビルドとテストに `vite` と `vitest`、リントとフォーマットに `biome` を採用しました。
- **API の変更**：`ModelContext` などのベータ版やアルファ版の API が削除されました。

## なぜアップグレードするのか

v2 へのアップグレードにより：

- **パフォーマンスとセキュリティの向上**：最新の Node.js LTS バージョンをサポートすることで、より安全で高速なライブラリを提供します。
- **モジュール性の向上**：ライブラリがよりモジュール化され、保守性と柔軟性が向上します。
- **開発体験の向上**：最新のツールにより、開発ワークフローがスムーズになります。
- **将来への適応**：最新の JavaScript エコシステムに合わせた設計となります。

## マイグレーション手順

### 1. Node.js バージョンの更新

**Node.js 18** 以上を使用していることを確認してください。

**Node.js バージョンの確認：**

```sh
node -v
```

**必要に応じて、[公式サイト](https://nodejs.org/ja/download/)の手順に従って Node.js を更新するか、`nvm` などのバージョンマネージャを使用してください。**

### 2. 依存関係の更新

`ts-graphviz` パッケージをバージョン 2 に更新します。

```json
{
  "dependencies": {
    "ts-graphviz": "^2.0.0"
  }
}
```

以下のコマンドを実行します：

```sh
npm install ts-graphviz@^2.0.0
```

### 3. インポートパスの確認

`ts-graphviz/adapter` や `ts-graphviz/ast` といったモジュールを使用している場合、引き続き `ts-graphviz` パッケージ経由で利用できます。

**例：**

```typescript
import { digraph } from 'ts-graphviz';
import { toFile } from 'ts-graphviz/adapter';
import { parse } from 'ts-graphviz/ast';
```

### 4. オプション：特定のパッケージを使用

必要な機能のみを利用し、依存関係を最小限に抑えたい場合は、以下の特定のパッケージを直接依存関係に追加できます：

- `@ts-graphviz/adapter`
- `@ts-graphviz/ast`
- `@ts-graphviz/common`

**例：**

```json
{
  "dependencies": {
    "@ts-graphviz/ast": "^2.0.0"
  }
}
```

そして、インポート：

```typescript
import { parse } from '@ts-graphviz/ast';
```

### 5. 型システムの拡張を移行

型システムを拡張していた場合、インポートパスを `@ts-graphviz/common` に更新してください。

**例：**

```diff
- import { $keywords } from 'ts-graphviz';
+ import { $keywords } from '@ts-graphviz/common';
```

### 6. 削除された API の更新

`ModelContext` などのベータ版やアルファ版の API は削除されました。これらの API を使用している場合は、コードをリファクタリングしてください。

:::note 方針変更と差分

**注意：** 以前のガイダンスでは、`ts-graphviz/adapter` を `@ts-graphviz/adapter` に変更し、依存関係に `@ts-graphviz/adapter` を追加することを推奨していました。しかし、互換性を維持するために、`ts-graphviz` パッケージ内で `ts-graphviz/adapter` や `ts-graphviz/ast` モジュールを引き続き利用できるようにしました。これにより、インポートパスや依存関係を変更する必要はありません。

この方針変更は、pnpm などの厳密な依存関係管理ツールがある現状に合わせ、ユーザーの移行コストを削減するためです。

一方で、必要な機能のみを利用し、アプリケーションのコードサイズを小さく保ちたいユーザーには、特定のパッケージ（`@ts-graphviz/adapter`、`@ts-graphviz/ast` など）を直接依存関係に追加することを推奨します。
:::
