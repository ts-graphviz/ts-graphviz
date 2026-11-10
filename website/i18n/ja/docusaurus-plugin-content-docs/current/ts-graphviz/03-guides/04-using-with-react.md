---
description: ReactとJSXで宣言的なグラフを作る@ts-graphviz/reactの使用法
---
# `@ts-graphviz/react` の使用

`@ts-graphviz/react` を使用すると、React の宣言的な UI パラダイムを使ってグラフを定義できます。

JSX を活用することで、DOT 言語のモデルをより直感的でコンポーネントベースの方法で表現でき、再利用性と可読性を向上させます。

## 特徴

- **宣言的なグラフ定義**: JSX を使用して、グラフ、ノード、エッジを宣言的に定義します。
- **JSX による HTML ライクなラベル**: JSX を使って複雑でリッチなラベルを作成し、グラフ内で HTML ライクなラベルとしてレンダリングできます。
- **コンポーネントの再利用性**: 再利用可能なグラフコンポーネントを構築し、コードベースの保守性を高めます。

## インストール

```bash npm2yarn
npm install @ts-graphviz/react react react-dom
```

## 例

```jsx
import React from 'react';
import { Digraph, Node, Edge, renderToDot } from '@ts-graphviz/react';

const MyDiagram = () => (
  <Digraph id="G">
    <Node id="A" label="Node A" />
    <Node
      id="B"
      label={
        <dot:table border={0} cellborder={1} cellspacing={0}>
          <dot:tr>
            <dot:td>left</dot:td>
            <dot:td port="m">middle</dot:td>
            <dot:td port="r">right</dot:td>
          </dot:tr>
        </dot:table>
      }
    />
    <Edge targets={['A', 'B']} label={<b>A から B へのエッジ</b>} />
  </Digraph>
);

const dot = renderToDot(<MyDiagram />);
console.log(dot);
```

### 説明

- **JSX 構文**: JSX を使用してノードやエッジを定義し、コードをより読みやすくします。
- **HTML ライクなラベル**: JSX を活用してリッチなラベルをノードやエッジに作成します。
- **コンポーネントベースの設計**: グラフのロジックを React コンポーネント内にカプセル化し、再利用性を高めます。

## `@ts-graphviz/react` を使用するタイミング

- グラフを宣言的に定義したい場合。
- React に精通しており、そのパラダイムを活用したい場合。
- HTML ライクな構文を使って複雑なラベルを作成する必要がある場合。
