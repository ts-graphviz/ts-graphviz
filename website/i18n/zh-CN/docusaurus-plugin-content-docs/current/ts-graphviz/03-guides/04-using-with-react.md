---
description: 使用 @ts-graphviz/react 通过 React 和 JSX 进行声明式图表创建。
---
# 使用 `@ts-graphviz/react`

`@ts-graphviz/react` 允许您使用 React 的声明式 UI 范式定义图表。

通过利用 JSX，您可以以更直观和基于组件的方式表达 DOT 语言模型，增强了可重用性和可读性。

## 功能

- **声明式图表定义**：使用 JSX 以声明式方式定义图表、节点和边。
- **类似 HTML 的标签与 JSX**：使用 JSX 创建复杂而丰富的标签，这些标签可以在您的图表中渲染为类似 HTML 的标签。
- **组件可重用性**：构建可重用的图表组件，使您的代码库更易维护。

## 安装

```bash npm2yarn
npm install @ts-graphviz/react react react-dom
```

## 示例


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
    <Edge targets={['A', 'B']} label={<b>Edge from A to B</b>} />
  </Digraph>
);

const dot = renderToDot(<MyDiagram />);
console.log(dot);
```

### 说明

- **JSX 语法**：使用 JSX 定义节点和边，使代码更具可读性。
- **类似 HTML 的标签**：利用 JSX 为节点和边创建丰富的标签。
- **基于组件的设计**：将图表逻辑封装在 React 组件中，以实现可重用性。

## 何时使用 `@ts-graphviz/react`

- 当您倾向于使用声明式方法定义图表时。
- 如果您已经熟悉 React 并希望利用其范式时。
- 当您需要使用类似 HTML 的语法创建复杂标签时。
