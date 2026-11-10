---
description: 使用 @ts-graphviz/ast 在 AST 级别操作 DOT 图。
---
# 使用抽象语法树（AST）

对于高级用例，`ts-graphviz/ast` 模块提供了一个 API 来处理 DOT 语言图的抽象语法树（AST）。

## 可用函数

提供了以下函数：

- `fromModel`：将 **Model** 转换为 **AST**。
- `toModel`：将 **AST** 转换为 **Model**。
- `stringify`：将 **AST** 转换为 **DOT** 字符串。
- `parse`：将 **DOT** 字符串转换为 **AST**。

![状态机](./img/state-machine.svg)

:::note
`ts-graphviz` 包提供的 `toDot` 函数是 `fromModel` 和 `stringify` 的组合。`fromDot` 函数是 `parse` 和 `toModel` 的组合。
:::

## 示例

### 将 DOT 字符串解析为 AST

```typescript
import { parse } from 'ts-graphviz/ast';

const ast = parse(`
  digraph example {
    node1 [
      label = "My Node",
    ]
  }
`);

console.log(JSON.stringify(ast, null, 2));
```

`ast` 变量现在包含 DOT 图的 AST 表示，您可以通过编程方式对其进行操作。

<details>
<summary>点击查看 AST 结构</summary>

```json
{
  "type": "Dot",
  "location": {
    "start": { "offset": 3, "line": 2, "column": 3 },
    "end": { "offset": 68, "line": 7, "column": 1 }
  },
  "children": [
    {
      "id": {
        "value": "example",
        "quoted": false,
        "type": "Literal",
        "location": {
          "start": { "offset": 11, "line": 2, "column": 11 },
          "end": { "offset": 18, "line": 2, "column": 18 }
        },
        "children": []
      },
      "directed": true,
      "strict": false,
      "type": "Graph",
      "location": {
        "start": { "offset": 3, "line": 2, "column": 3 },
        "end": { "offset": 67, "line": 6, "column": 4 }
      },
      "children": [
        {
          "id": {
            "value": "node1",
            "quoted": false,
            "type": "Literal",
            "location": {
              "start": { "offset": 25, "line": 3, "column": 5 },
              "end": { "offset": 30, "line": 3, "column": 10 }
            },
            "children": []
          },
          "type": "Node",
          "location": {
            "start": { "offset": 25, "line": 3, "column": 5 },
            "end": { "offset": 63, "line": 5, "column": 6 }
          },
          "children": [
            {
              "key": {
                "value": "label",
                "quoted": false,
                "type": "Literal",
                "location": {
                  "start": { "offset": 39, "line": 4, "column": 7 },
                  "end": { "offset": 44, "line": 4, "column": 12 }
                },
                "children": []
              },
              "value": {
                "value": "My Node",
                "quoted": true,
                "type": "Literal",
                "location": {
                  "start": { "offset": 47, "line": 4, "column": 15 },
                  "end": { "offset": 56, "line": 4, "column": 24 }
                },
                "children": []
              },
              "location": {
                "start": { "offset": 39, "line": 4, "column": 7 },
                "end": { "offset": 57, "line": 4, "column": 25 }
              },
              "type": "Attribute",
              "children": []
            }
          ]
        }
      ]
    }
  ]
}
```

</details>
