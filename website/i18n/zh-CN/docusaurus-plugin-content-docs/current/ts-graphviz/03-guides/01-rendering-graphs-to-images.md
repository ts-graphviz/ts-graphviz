---
description: 使用 ts-graphviz 将图表渲染为 SVG 或 PNG 等图像。
---
# 将图表渲染为图像

虽然 `ts-graphviz` 模块专注于使用 DOT 语言建模图表并生成 DOT 字符串，但您可能希望将图表渲染为 SVG 或 PNG 等图像格式。这时，`ts-graphviz/adapter` 模块就派上用场了。

`ts-graphviz/adapter` 模块允许您在各种运行时环境（Node.js、Deno）中执行 Graphviz 的 `dot` 命令，将 DOT 字符串转换为图像文件。这使您能够在应用程序中将图表可视化为图像，或将其导出以供其他地方使用。

:::danger
目前，`ts-graphviz/adapter` 不支持在浏览器中运行。如果您想在浏览器中可视化 DOT 语言或将其输出为图像，需要使用其他 npm 库，例如 [d3-graphviz](https://www.npmjs.com/package/d3-graphviz) 或 [@hpcc-js/wasm-graphviz](https://www.npmjs.com/package/@hpcc-js/wasm-graphviz)。
:::

## 功能：

- **执行 Graphviz 命令**：从代码中运行 `dot` 命令以生成图像。
- **支持多种运行时**：适用于 Node.js 和 Deno 环境。
- **输出格式**：将 DOT 字符串转换为 SVG、PNG、PDF 等格式。

:::warning
确保在您的系统上安装了 [Graphviz](https://graphviz.org/download/)，以便 `dot` 命令可用。
:::

## 示例：

### 将 DOT 转换为图像流

```typescript
import { toStream } from 'ts-graphviz/adapter';

const dot = `
  digraph example {
    node1 [ label = "My Node" ];
  }
`;

const stream = await toStream(dot, { format: 'svg' });

// In Node.js
stream.pipe(process.stdout);

// In Deno
await stream.pipeTo(Deno.stdout.writable);
```

### 将 DOT 写入图像文件

```typescript
import { toFile } from 'ts-graphviz/adapter';

const dot = `
  digraph example {
    node1 [ label = "My Node" ];
  }
`;

await toFile(dot, './result.svg', { format: 'svg' });
```

## 说明

- **执行 `dot` 命令**：适配器提供的函数内部执行 `dot` 命令，使用提供的 DOT 字符串和选项。
- **输出格式**：通过选项指定所需的输出格式（例如 `svg`、`png`）。
- **运行时兼容性**：设计用于在 Node.js 和 Deno 环境中无缝运行。

## 何时使用 `ts-graphviz/adapter` 模块

- 当您需要将图表渲染为图像文件以进行可视化时。
- 如果您希望在应用程序中动态生成图像。
- 当将图表渲染集成到服务器端脚本或应用程序中时。

## 附加说明

- **浏览器支持**：`ts-graphviz/adapter` 不支持在浏览器环境中运行。如果需要在浏览器中渲染图表，请考虑使用 `d3-graphviz` 或 `@hpcc-js/wasm-graphviz` 等库。这些库使用 WebAssembly 在浏览器中渲染 DOT 图表。
- **Graphviz 安装**：确保已安装 Graphviz 并在系统的 PATH 中可访问。
- **错误处理**：处理 `dot` 命令失败或未安装 Graphviz 时可能发生的错误。
