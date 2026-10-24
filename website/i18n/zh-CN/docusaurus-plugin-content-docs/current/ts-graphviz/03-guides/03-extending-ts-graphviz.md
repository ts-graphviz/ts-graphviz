---
description: 如何扩展 ts-graphviz 以满足高级用例。
---
# 扩展 ts-graphviz

`ts-graphviz` 设计为可扩展的，允许中级用户根据特定需求自定义和增强库的功能。本节介绍如何扩展类型系统和创建自定义实现。

## 创建自定义类

您可以通过继承现有类来添加自己的实现。这允许您为图形元素定义自定义行为或默认属性。

```typescript
import { Digraph, Node, Edge, EdgeTargetTuple, attribute as _, toDot } from 'ts-graphviz';

class MyCustomDigraph extends Digraph {
  constructor() {
    super('G', {
      [_.label]: 'This is Custom Digraph',
    });
  }
}

class MyCustomNode extends Node {
  constructor(id: string) {
    super(`node_${id}`, {
      [_.label]: `This is Custom Node ${id}`,
    });
  }
}

class MyCustomEdge extends Edge {
  constructor(targets: EdgeTargetTuple) {
    super(targets, {
      [_.label]: 'This is Custom Edge',
    });
  }
}

const digraph = new MyCustomDigraph();
const node1 = new MyCustomNode('A');
const node2 = new MyCustomNode('B');
const edge = new MyCustomEdge([node1, node2]);
digraph.addNode(node1);
digraph.addNode(node2);
digraph.addEdge(edge);

const dot = toDot(digraph);
console.log(dot);
/* 输出:
digraph "G" {
  label = "This is Custom Digraph";
  "node_A" [
    label = "This is Custom Node A";
  ];
  "node_B" [
    label = "This is Custom Node B";
  ];
  "node_A" -> "node_B" [
    label = "This is Custom Edge";
  ];
}
*/
```

### 模型上下文 API (`with` 方法)

您还可以使用 **模型上下文 API** 为图形内部生成的对象创建自定义类。`Digraph`、`Graph` 和 `Subgraph` 的 `with` 方法允许您预定义自定义模型。

```typescript
const g = new Digraph();
g.with({
  Node: MyCustomNode,
  Edge: MyCustomEdge,
});

const a = g.createNode('A'); // MyCustomNode 的实例
const b = g.createNode('B'); // MyCustomNode 的实例
g.createEdge([a, b]);        // MyCustomEdge 的实例

const dot = toDot(g);
console.log(dot);
/* 输出:
digraph {
  "node_A" [
    label = "This is Custom Node A";
  ];
  "node_B" [
    label = "This is Custom Node B";
  ];
  "node_A" -> "node_B" [
    label = "This is Custom Edge";
  ];
}
*/
```

## 扩展类型系统

使用 `ts-graphviz`，您可以扩展库的类型系统，以定制图形可视化解决方案。当您需要指定自定义图形布局、输出格式，或添加默认不支持的自定义属性时，这非常有用。

### 使用 `$` 符号进行自定义

为了允许自定义，旨在扩展的类型以 `$` 符号命名。如果您需要扩展以下未列出的类型定义，请检查源代码以查看是否可以使用 `$...` 进行扩展。如果不能，请创建一个问题或拉取请求。

### 用例

#### 指定自定义图形布局和输出格式

您可以通过扩展 `@ts-graphviz/adapter` 中的类型来指定自定义布局算法和输出格式。如下所示：

```typescript
import { $keywords } from '@ts-graphviz/common';
import { toFile } from '@ts-graphviz/adapter';

// 1. 声明 '@ts-graphviz/adapter' 模块。
declare module '@ts-graphviz/adapter' {
  export namespace Layout {
    // 2. 在 Layout 命名空间中定义 $values 接口。
    // 3. 使用自定义布局算法的名称扩展 $keywords。
    export interface $values extends $keywords<'my-custom-algorithm'> {}
  }

  export namespace Format {
    // 4. 在 Format 命名空间中定义 $values 接口。
    // 5. 使用自定义输出格式的名称扩展 $keywords。
    export interface $values extends $keywords<'mp4'> {}
  }
}

// 现在您可以使用自定义布局和格式。
toFile('digraph { a -> b }', '/path/to/file', {
  layout: 'my-custom-algorithm',
  format: 'mp4',
});
```

#### 添加自定义属性

您可以通过扩展 `@ts-graphviz/common` 中的类型来添加自定义属性：

```typescript
import { $keywords } from '@ts-graphviz/common';
import { digraph, toDot, attribute as _ } from 'ts-graphviz';

// 1. 声明 '@ts-graphviz/common' 模块。
declare module '@ts-graphviz/common' {
  export namespace GraphAttributeKey {
    // 2. 在 GraphAttributeKey 命名空间中定义 $values 接口。
    // 3. 使用自定义属性的名称扩展 $keywords。
    export interface $values extends $keywords<'hoge'> {}
  }

  export namespace Attribute {
    // 4. 在 Attribute 命名空间中定义 $keys 接口。
    // 5. 使用自定义属性的名称扩展 $keywords。
    export interface $keys extends $keywords<'hoge'> {}

    // 6. 在 Attribute 命名空间中定义 $types 接口。
    // 7. 指定自定义属性的类型。
    export interface $types {
      hoge: string;
    }
  }
}

// 现在您可以使用自定义属性。
console.log(
  toDot(
    digraph((g) => {
      g.set(_.hoge, 'fuga');
    }),
  ),
);
```

---

## 内部包概览

对于有兴趣扩展或自定义 `ts-graphviz` 的用户，了解内部包可能会有帮助。以下是内部包的概述，以及它们如何在高级场景中使用。

### `@ts-graphviz/adapter`

**目的**：提供执行 Graphviz 命令和将 DOT 语言字符串转换为各种输出格式的接口。

**用法**：

- 将 DOT 字符串转换为流或文件。
- 在需要将图表渲染为图像或其他格式的环境中使用。

:::note
您可以使用 `@ts-graphviz/adapter` 或 `ts-graphviz/adapter` 导入。后者为向后兼容而维护。
:::

### `@ts-graphviz/ast`

**目的**：允许在抽象语法树（AST）级别操作 DOT 语言。

**用法**：

- 将 DOT 字符串解析为 AST 节点。
- 程序化地操作和转换 AST。
- 对现有 DOT 代码进行高级分析或转换。

:::note
您可以使用 `@ts-graphviz/ast` 或 `ts-graphviz/ast` 导入。后者为向后兼容而维护。
:::

### `@ts-graphviz/common`

**目的**：集中管理 Graphviz 领域知识，提供类型定义、常量和实用程序。它旨在处理扩展类型等用例。

**用法**：

- 扩展或自定义类型和属性。
- 在使用自定义属性时确保类型安全。
- 聚合 Graphviz 的领域知识，以在各个包中保持一致的使用。

### `@ts-graphviz/core`

**目的**：包含向用户提供的模型和函数的核心实现。

**用法**：

- 使用面向对象的 API 对图形元素进行细粒度控制。
- 扩展类以实现自定义行为或属性。
