---
description: ts-graphvizをインストールしてすぐにグラフ作成を始めましょう
---
# インストール

## Node.js

このパッケージは、パッケージマネージャーを使用してインストールできます。

```bash npm2yarn
npm install ts-graphviz
```

TypeScript で使う場合は **TypeScript 5.0 以降**が必要です（[バージョニングポリシー](../11-advanced-topics/03-versioning-policy.md#supported-typescript-versions)を参照）。

## Deno

以下を指定してパッケージをインポートして使用できます。

```ts no-check
import { toDot } from 'npm:ts-graphviz';
```

:::info
[Deno v1.28 以降は npm をサポートしています。](https://deno.land/manual/node/npm_specifiers).
:::
