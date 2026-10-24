---
description: 了解 ts-graphviz，这是一个用于 Graphviz 的 TypeScript 库。
---
# 介绍

## 什么是 Graphviz？

[Graphviz](https://graphviz.org/) 是一个开源的图形可视化软件，允许您将结构化信息表示为抽象图和网络的图表。
它使用一种称为 DOT 的语言来描述节点、边及其关系，然后可以将其渲染为各种图形格式，如 PNG、SVG、PDF 等。
Graphviz 在学术界和工业界被广泛用于可视化复杂结构。如层次结构、数据流和状态转换图。

<div align="center">

![Graphviz logo](https://graphviz.org/Resources/app.png)

<i>Graphviz 标志</i>
</div>

## 什么是 ts-graphviz？

**ts-graphviz** 是一个用于 TypeScript 的 Graphviz 库，允许您在 TypeScript/JavaScript 生态系统中直接利用 [Graphviz](https://graphviz.gitlab.io/) 的强大功能。它将 Graphviz 的 DOT 语言与 TypeScript 完全集成，支持图的程序化生成和操作。这使得基于动态数据可视化复杂图形和网络结构变得容易。

<div align="center">

![ts-graphviz logo](/img/logo.png)

<i>ts-graphviz 标志</i>
</div>

### ts-graphviz 的主要功能

- **TypeScript 集成**：提供强类型和与 TypeScript 项目的无缝集成，提高开发效率和类型安全性。
- **面向对象的 API**：提供直观的面向对象 API，用于创建和操作图、节点和边。
- **声明式和命令式风格**：支持声明式和命令式编程风格，灵活地构建图形。
- **可扩展性**：允许自定义和扩展库的类型系统以满足特定需求。
- **跨平台支持**：适用于 Node.js、Deno 和浏览器环境，使其适用于不同的项目。
- **AST 操作**：支持在抽象语法树（AST）级别操作 DOT 语言，以应对高级用例。
