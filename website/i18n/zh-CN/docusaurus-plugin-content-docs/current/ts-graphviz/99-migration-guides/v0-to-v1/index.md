---
description: |-
  使用我们全面的迁移指南，将您的 ts-graphviz 项目从 v0 升级到 v1。了解转向基于 AST 的设计、接口重命名，以及如何更新您的代码以提升性能和类型安全。
---
# 从 v0 迁移到 v1

## 变更概述

在从 ts-graphviz v0 迁移到 v1 的过程中，对库的架构和 API 进行了重大更改：

- **转向基于 AST 的设计**：集成了围绕抽象语法树（AST）的模块，整合了与将模型字符串化为 DOT 语言相关的函数。
- **引入 `ts-graphviz/ast` 模块**：将 `@ts-graphviz/parser` 包集成到 `ts-graphviz/ast` 模块中，提供了诸如 `parse` 和 `stringify` 的 AST 相关处理功能。
- **属性类型**：引入了各种属性的类型定义，使在指定属性时获得更好的编辑器辅助和 TypeScript 检查。
- **接口命名约定**：解决了接口命名中的歧义。以前以 `I` 前缀（例如 `ICluster`）命名的接口被重命名，以与 AST 类型保持一致的命名。

## 为什么升级？

升级到 v1 提供了多个好处：

- **统一的 AST 处理**：集成 AST 模块提升了性能，并简化了在 AST 级别操作图形的过程。
- **增强的类型安全性**：随着属性类型的引入，您在 IDE 中获得了更好的类型检查和 IntelliSense 支持。
- **一致的命名**：新的命名约定使库更加直观和一致，减少了混淆。

## 迁移步骤


### 1. 更新依赖

在您的 `package.json` 中将 `ts-graphviz` 包更新到版本 1：

```json
{
  "dependencies": {
    "ts-graphviz": "^1.0.0"
  }
}
```

然后运行：

```sh
npm install ts-graphviz@^1.0.0
```

### 2. 更新接口名称

接口名称已更改。按如下方式更新您的代码：

- `INode` ➔ `NodeModel`
- `IEdge` ➔ `EdgeModel`
- `ICluster` ➔ `GraphBaseModel`（已弃用，请使用 `GraphModel` 或 `SubgraphModel`）
- `ISubgraph` ➔ `SubgraphModel`
- `IRootCluster` ➔ `RootGraphModel`

**示例：**

```diff
- import { INode } from 'ts-graphviz';
+ import { NodeModel } from 'ts-graphviz';

- const node: INode = ...;
+ const node: NodeModel = ...;
```

### 3. 使用新的 `ts-graphviz/ast` 模块

如果您使用的是 `@ts-graphviz/parser`，请迁移到新的 `ts-graphviz/ast` 模块。

**示例：**

```diff
- import { parse, stringify } from '@ts-graphviz/parser';
+ import { parse, stringify } from 'ts-graphviz/ast';

const dot = 'digraph { a -> b }';
const ast = parse(dot);
// Manipulate AST...
const newDot = stringify(ast);
```

### 4. 更新属性使用

随着属性类型的引入，您现在可以导入特定的属性键和值。

**示例：**

```typescript
import { attribute } from 'ts-graphviz';

g.node('Node1', {
  [attribute.label]: 'My Node',
  [attribute.color]: 'red',
});
```
