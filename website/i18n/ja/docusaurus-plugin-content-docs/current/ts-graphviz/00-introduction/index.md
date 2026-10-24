---
description: TypeScriptでGraphvizの図を作成・操作するts-graphvizの紹介
---
# はじめに

## Graphviz とは？

[Graphviz](https://graphviz.org/) は、抽象的なグラフやネットワークの図として構造情報を表現することができる、オープンソースのグラフ可視化ソフトウェアです。
ノード、エッジ、およびそれらの関係を記述するために DOT 言語を使用し、それを PNG、SVG、PDF などのさまざまなグラフィック形式にレンダリングできます。Graphviz は、階層構造、データフロー、状態遷移図など、複雑な構造を可視化するために、学術や産業界で広く使用されています。

<div align="center">

![Graphviz logo](https://graphviz.org/Resources/app.png)

<i>Graphviz logo</i>
</div>

## ts-graphviz とは？

**ts-graphviz** は TypeScript 用の Graphviz ライブラリであり、TypeScript/JavaScript エコシステム内で [Graphviz](https://graphviz.gitlab.io/) の強力な機能を直接利用できます。Graphviz の DOT 言語を TypeScript と完全に統合し、プログラムによるグラフの生成と操作を可能にします。これにより、動的なデータに基づいた複雑なグラフやネットワーク構造を簡単に可視化できます。

<div align="center">

![ts-graphviz logo](/img/logo.png)

<i>ts-graphviz のロゴ</i>
</div>

### ts-graphviz の主な特徴

- **TypeScript との統合**：強力な型定義と TypeScript プロジェクトへのシームレスな統合を提供し、開発効率と型安全性を向上させます。
- **オブジェクト指向 API**：グラフ、ノード、エッジの作成と操作のための直感的なオブジェクト指向 API を提供します。
- **宣言的および命令的スタイル**：宣言的および命令的なプログラミングスタイルの両方をサポートし、グラフの構築方法に柔軟性を持たせます。
- **拡張性**：ライブラリの型システムをカスタマイズおよび拡張でき、特定のニーズに対応できます。
- **クロスプラットフォーム対応**：Node.js、Deno、ブラウザ環境で動作し、さまざまなプロジェクトで活用できます。
- **AST 操作**：高度なユースケース向けに、DOT 言語を抽象構文木（AST）レベルで操作する機能を含みます。
