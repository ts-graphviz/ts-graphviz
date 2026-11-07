---
description: ts-graphvizでグラフをSVGやPNGの画像にレンダリング
---
# グラフの画像レンダリング

`ts-graphviz` モジュールは DOT 言語を使用してグラフをモデリングし、DOT 文字列を生成することに焦点を当てていますが、グラフを SVG や PNG などの画像形式にレンダリングしたい場合もあるでしょう。そのような場合に役立つのが `ts-graphviz/adapter` モジュールです。

`ts-graphviz/adapter` モジュールを使用すると、さまざまなランタイム環境（Node.js、Deno）で Graphviz の `dot` コマンドを実行し、DOT 文字列を画像ファイルに変換できます。これにより、アプリケーション内でグラフを画像として可視化したり、他の用途のためにエクスポートしたりできます。

## 特徴


- **Graphviz コマンドの実行**：コードから `dot` コマンドを実行して画像を生成します。
- **複数のランタイムサポート**：Node.js や Deno 環境で動作します。
- **出力形式**：DOT 文字列を SVG、PNG、PDF などの形式に変換します。


:::warning
システムに [Graphviz](https://graphviz.org/download/) がインストールされており、`dot` コマンドが利用可能であることを確認してください。
:::

## 例

### DOT を Blob にレンダリングする

```typescript
import { toBlob } from 'ts-graphviz/adapter';

const dot = `
  digraph example {
    node1 [ label = "My Node" ];
  }
`;

const blob = await toBlob(dot, { format: 'svg' });

console.log(blob.type); // 'image/svg+xml'
const svg = await blob.text();
```

`toBlob` は `dot` が成功してから、出力全体をメモリに持った状態で返ります。失敗はすべて、読み始める前に Promise の reject として届きます。Blob は `text()`、`arrayBuffer()`、`stream()` で読めるほか、リクエストハンドラーから `new Response(blob)` として返せます。

### 画像をファイルに書き込む

出力をどこに書くか、どのパスを許すかはアプリケーションが決めます。

```typescript
import { writeFile } from 'node:fs/promises';
import { toBlob } from 'ts-graphviz/adapter';

declare const dot: string;

const blob = await toBlob(dot, { format: 'png' });
await writeFile('./result.png', blob.stream());
// In Deno: await Deno.writeFile('./result.png', blob.stream());
```

:::tip
ブラウザーで SVG の Blob を表示するときは `<img src>` を使い、文書として開かないでください。`image/svg+xml` の `blob:` URL をタブやフレームで開くと、アプリケーションのオリジンで実行されます。
:::

## 解説

- **`dot` コマンドの実行**：アダプターは内部的に `dot` コマンドを実行し、提供された DOT 文字列とオプションを使用します。
- **出力形式**：オプションで希望する出力形式（例：`svg`、`png`）を指定します。
- **ランタイム互換性**：Node.js と Deno 環境の両方でシームレスに動作するように設計されています。

## `ts-graphviz/adapter` モジュールを使用するタイミング

- グラフを画像ファイルにレンダリングして可視化したい場合。
- アプリケーション内で画像を動的に生成したい場合。
- サーバーサイドのスクリプトやアプリケーションにグラフのレンダリングを統合する場合。

## 追加の注意点

- **ブラウザサポート**： @ts-graphviz/adapter はブラウザ環境での実行をサポートしていません。ブラウザ上でグラフをレンダリングする必要がある場合は、d3-graphviz や @hpcc-js/wasm などのライブラリを検討してください。これらは WebAssembly を使用してブラウザ内で DOT グラフをレンダリングします。
- **Graphviz のインストール**：Graphviz がシステムにインストールされ、PATH にアクセス可能であることを確認してください。
- **エラーハンドリング**：`dot` コマンドの失敗や Graphviz がインストールされていない場合に発生するエラーを適切に処理してください。
