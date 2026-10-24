---
description: ts-graphviz 的包架构。
---
# 包架构

**ts-graphviz** 由多个包组成，每个包具有特定的功能：

- **`ts-graphviz`**（主包）：提供用于创建和操作图表的高级 API，适合大多数用户。

- **`@ts-graphviz/core`**：包含模型和函数的核心实现，供内部使用并可供高级用户使用。

- **`@ts-graphviz/common`**：聚合 Graphviz 领域知识，提供类型定义、常量和实用工具。支持扩展自定义类型和属性等用例。

- **`@ts-graphviz/ast`**：提供在 AST 级别解析、操作和生成 DOT 语言图表的工具。

- **`@ts-graphviz/adapter`**：在各种运行时环境（Node.js、Deno）中执行 Graphviz 命令并将 DOT 字符串转换为图像。

- **`@ts-graphviz/react`**：允许使用 React 的声明式 UI 范式定义图表，使用 JSX 表达 DOT 语言模型。

## 将内部模块公开为子模块

**ts-graphviz** 将其一些内部模块作为子模块在主包中发布。具体来说，以下导入路径可用于访问这些内部模块：

- **`ts-graphviz/ast`** 或 **`@ts-graphviz/ast`**
- **`ts-graphviz/adapter`** 或 **`@ts-graphviz/adapter`**

这允许用户选择最适合其项目需求的模块导入方式。通过使用 `ts-graphviz/<module-name>` 风格，您可以将依赖限制在 `ts-graphviz` 库本身，内部包（例如 `@ts-graphviz/adapter`、`@ts-graphviz/ast`）由 `ts-graphviz` 包集中管理。另一方面，使用 `@ts-graphviz/<module-name>` 风格使您能够按模块管理依赖，允许根据需要选择性安装特定模块。

:::tip 选择导入路径时管理依赖

在使用强制严格依赖管理的包管理器（例如 pnpm）时，导入路径的选择会显著影响依赖的处理方式。请考虑以下几点：

- **使用 `ts-graphviz/<module-name>` 风格**：
  - **优势**：将依赖限制在 `ts-graphviz` 库本身，内部包（例如 `@ts-graphviz/adapter`、`@ts-graphviz/ast`）由 `ts-graphviz` 包集中管理。这可以防止依赖冲突，并确保使用库推荐的稳定版本。
  - **推荐场景**：当您希望最小化依赖项，或当 `ts-graphviz` 管理的内部包没有特定版本要求时。

- **使用 `@ts-graphviz/<module-name>` 风格**：
  - **优势**：允许您按模块管理依赖，仅安装所需的特定模块，有助于保持应用程序轻量。
  - **注意事项**：需要在包管理器中单独管理内部依赖项（例如 `@ts-graphviz/adapter`、`@ts-graphviz/ast`）。这可能会使版本管理变得复杂。
  - **推荐场景**：当您仅需要使用特定模块或需要详细控制依赖项时。

**总结**：
- 如果您偏好 **简单的依赖管理**，请使用 `ts-graphviz/<module-name>` 风格。
- 如果您需要 **精细控制依赖** 或仅需要特定模块，请选择 `@ts-graphviz/<module-name>` 风格。

这种方法使您能够以最适合项目需求的方式管理依赖项。

:::

包之间的关系可以如下所示进行可视化：

![包依赖图显示 ts-graphviz 包及其依赖关系](./img/dependency-graph.svg)

这种模块化架构确保：

- **可维护性**：单个包可以在不影响其他包的情况下维护和更新。

- **灵活性**：用户可以仅选择其特定用例所需的包。

- **可扩展性**：便于随着库的发展添加新功能或包。
