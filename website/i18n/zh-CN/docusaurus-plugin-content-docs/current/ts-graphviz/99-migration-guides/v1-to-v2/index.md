---
description: |-
  使用我们更新的迁移指南，将您的 ts-graphviz 项目从 v1 升级到 v2。了解最新的改进、Node.js 版本更新，以及如何在最小的更改下保持兼容性。发现如何在保持导入路径和依赖项基本不变的情况下更新您的项目。
---
# 从 v1 迁移到 v2

## 变更概述

ts-graphviz 的第 2 版引入了重大更新：

- **包拆分和 Monorepo 结构**：为了更好的模块化和可维护性，库现在被划分为多个包。然而，为了保持向后兼容，`ts-graphviz` 包继续提供相同的功能，包括 `ts-graphviz/adapter` 和 `ts-graphviz/ast` 等模块。
- **停止支持 Node.js 14 和 16**：最低要求的 Node.js 版本现在为 **Node.js 18**。
- **更新的开发工具**：迁移到 `pnpm`，使用 `vite` 和 `vitest` 进行构建和测试，并采用 `biome` 进行代码检查和格式化。
- **API 变更**：移除了诸如 `ModelContext` 之类的 beta 和 alpha API。

## 为什么升级？

升级到 v2 确保：

- **更好的性能和安全性**：支持最新的 Node.js LTS 版本。
- **改进的模块化**：库更加模块化，允许更好的可维护性和灵活性。
- **增强的开发体验**：更新的工具提供了更顺畅的工作流程。
- **未来兼容性**：与最新的 JavaScript 生态系统改进保持一致。

## 迁移步骤 {#migration-steps-v1-v2}

### 1. 更新 Node.js 版本

确保您的环境运行的是 **Node.js 18** 或更高版本。

**检查 Node.js 版本：**

```sh
node -v
```

**如果需要，请通过[官方说明](https://nodejs.org/en/download/)更新 Node.js，或使用像 `nvm` 这样的版本管理器。**

### 2. 更新依赖

在您的 `package.json` 中将 `ts-graphviz` 包更新到版本 2：

```json
{
  "dependencies": {
    "ts-graphviz": "^2.0.0"
  }
}
```

然后运行：

```sh
npm install ts-graphviz@^2.0.0
```

### 3. 验证导入路径

如果您正在使用 `ts-graphviz/adapter` 或 `ts-graphviz/ast` 等模块，您可以继续通过 `ts-graphviz` 包像以前一样使用它们。

**示例：**

```typescript
import { digraph } from 'ts-graphviz';
import { toFile } from 'ts-graphviz/adapter';
import { parse } from 'ts-graphviz/ast';
```

### 4. 可选：使用特定包

如果您只需要特定的功能并希望最小化依赖项，可以直接依赖特定的包：

- `@ts-graphviz/adapter`
- `@ts-graphviz/ast`
- `@ts-graphviz/common`

**示例：**

```json
{
  "dependencies": {
    "@ts-graphviz/ast": "^2.0.0"
  }
}
```

并导入：

```typescript
import { parse } from '@ts-graphviz/ast';
```

### 5. 迁移类型系统扩展

如果您扩展了类型系统，请将导入路径从 `ts-graphviz` 更新为 `@ts-graphviz/common`。

**示例：**

```diff
- import { $keywords } from 'ts-graphviz';
+ import { $keywords } from '@ts-graphviz/common';
```

### 6. 更新已移除的 API

提供于 beta 和 alpha 阶段的 API，如 `ModelContext`，已被移除。请重构您的代码以避免使用这些 API。

:::note 政策变更与差异
在之前的指南中，我们建议将导入从 `ts-graphviz/adapter` 更改为 `@ts-graphviz/adapter`，并将 `@ts-graphviz/adapter` 添加到您的依赖项中。然而，我们决定在 `ts-graphviz` 包内保持向后兼容性。您可以继续使用 `ts-graphviz/adapter` 和 `ts-graphviz/ast` 模块，而无需更改导入路径或添加新依赖项。

这种方法降低了迁移成本，并与现代包管理实践保持一致，特别是对于像 `pnpm` 这样的严格依赖管理工具。

对于只需要特定功能并希望最小化依赖项的用户，我们鼓励您直接依赖特定的包（如 `@ts-graphviz/adapter`、`@ts-graphviz/ast` 等）以保持应用程序的轻量化。
:::
