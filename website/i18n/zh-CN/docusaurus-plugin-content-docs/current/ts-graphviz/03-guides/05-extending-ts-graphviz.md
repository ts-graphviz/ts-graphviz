---
description: 如何扩展 ts-graphviz 以满足高级用例。
---
# 扩展 ts-graphviz

`ts-graphviz` 设计为可扩展的，允许中级用户根据特定需求自定义和增强库的功能。本节介绍如何扩展类型系统和创建自定义实现。关于模型本身，请参阅[DOT Object Model（DOM）](./02-model-api.md)。

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

### 自定义类的套件 (`createModelKit`)

模型套件用您提供的类创建模型。`createModelKit` 接受自定义类，其余的使用默认类。

```typescript
import {
  createModelKit,
  Node,
  Edge,
  type EdgeAttributesObject,
  type EdgeTargetTuple,
  type NodeAttributesObject,
  attribute as _,
  toDot,
} from 'ts-graphviz';

class MyCustomNode extends Node {
  constructor(id: string, attributes?: NodeAttributesObject) {
    super(`node_${id}`, {
      [_.label]: `This is Custom Node ${id}`,
      ...attributes,
    });
  }
}

class MyCustomEdge extends Edge {
  constructor(targets: EdgeTargetTuple, attributes?: EdgeAttributesObject) {
    super(targets, {
      [_.label]: 'This is Custom Edge',
      ...attributes,
    });
  }
}

const kit = createModelKit({
  Node: MyCustomNode,
  Edge: MyCustomEdge,
});

const g = kit.createDigraph();
const a = kit.createNode('A'); // MyCustomNode 的实例
const b = kit.createNode('B'); // MyCustomNode 的实例
g.addNode(a);
g.addNode(b);
g.addEdge(kit.createEdge([a, b])); // MyCustomEdge 的实例

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

### 自定义类型

自定义的属性和值类型，以及 Graphviz 插件添加的布局引擎和输出格式，都列在模式（`defineSchema`）中：属性为一个套件的模型提供类型，格式和布局为传入该模式的适配器调用提供类型。整个程序的类型不会改变：不能通过声明合并（`declare module '@ts-graphviz/common'`）扩展类型。

### 用例

#### 指定自定义图形布局和输出格式

Graphviz 插件添加的布局引擎和输出格式，连同名称（`values.extend('mp4')`）列在模式的 `types.layout` 和 `types.format` 中，并将该模式传给适配器的 `schema` 选项。模式与 `dotCommand` 一样是受信任的配置：在代码中定义，切勿从最终用户的输入构造。`isFormat` / `isLayout` 只对文档中列出的名称返回 true：用它们检查来自请求的 `format` 或 `layout`，使请求无法选择插件的格式或布局。

```typescript
import { toBlob } from '@ts-graphviz/adapter';
import { defineSchema, values } from '@ts-graphviz/common';

// 在模式中列出 Graphviz 插件添加的布局引擎和输出格式：作为 `schema`
// 传入后，它们仅在这次调用中在运行时被接受，并放宽 `layout` 和 `format`
// 的类型。全局不会有任何改变，`isFormat` / `isLayout` 仍然只对文档中
// 列出的名称返回 true。
const schema = defineSchema({
  types: {
    layout: values.extend('my-custom-algorithm'),
    format: values.extend('mp4'),
  },
});
const video = await toBlob('digraph { a -> b }', {
  schema,
  layout: 'my-custom-algorithm',
  format: 'mp4',
  // sanitize 会拒绝它未检查过的格式，因此关闭它
  sanitize: false,
});
```

#### 添加自定义属性

模式列出套件的模型在内置之外（或代替内置）接受的属性和值类型：

```typescript
import { attr, defineSchema, toDot, values, withModelKit } from 'ts-graphviz';

// 除内置之外，图接受的属性和值类型。
const schema = defineSchema({
  graph: { hoge: attr<string>() }, // 新属性
  node: {
    'data-id': attr<number>(),
    label: attr.override<number>(), // 用数字代替内置类型
  },
  types: { color: values.extend<'brand-blue'>() }, // 所有 color 类型的属性
});

const { digraph } = withModelKit({ schema });
console.log(
  toDot(
    digraph((g) => {
      g.hoge = 'fuga';
      g.node('a', { 'data-id': 1, label: 2, color: 'brand-blue' });
    }),
  ),
);
```

- `attr<T>()` 添加属性；`attr.extend<T>()`（内置类型或 `T`）和 `attr.override<T>()`（用 `T` 代替）修改内置属性。每个条目都给出其类型，并且总是明确说明适用哪一种：对内置属性使用 `attr<T>()` 是类型错误。
- `types` 通过 `values.extend<T>()` 或 `values.override<T>()` 修改值类型（`color`、`style`、`shape`、`arrowType` 等），从而修改使用该类型的所有属性。
- 种类为 `graph`、`subgraph`、`cluster`、`node` 和 `edge`。
- 只有该套件的模型使用模式进行类型检查：`withModelKit({ schema })`、`createModelKit({ schema, Node: MyNode })`（配合 `class MyNode extends Node<typeof schema> {}`）以及 `fromDot(dot, { convert: { models: { schema } } })`。其他图（例如某个库的图）不受影响。

---

## 内部包概览

对于有兴趣扩展或自定义 `ts-graphviz` 的用户，了解内部包可能会有帮助。以下是内部包的概述，以及它们如何在高级场景中使用。

### `@ts-graphviz/adapter`

**目的**：提供执行 Graphviz 命令和将 DOT 语言字符串转换为各种输出格式的接口。

**用法**：

- 使用 `toBlob` 将 DOT 字符串渲染为 `Blob`。
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
