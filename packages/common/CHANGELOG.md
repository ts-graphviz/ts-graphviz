# @ts-graphviz/common

## 2.0.0

> It is part of the ts-graphviz library, which is split into modular packages to improve maintainability, flexibility, and ease of use.

This package contains type information, constants, and utility functions related to the DOT language attributes, attribute values, and models for ts-graphviz.

## Features

- Type definitions for DOT language elements, such as attributes and attribute values
- Constants representing common attribute names and values
- Utility functions for working with DOT language elements

## Usage

Import the necessary types, constants, or utility functions from the `@ts-graphviz/common` package:

```ts
import { NodeAttributesObject, EdgeAttributesObject } from '@ts-graphviz/common';
```

Use the imported items in your project to work with the DOT language elements:


```ts
const nodeAttr: NodeAttributesObject = {
  label: 'Node label',
  shape: 'ellipse',
};

const edgeAttr: EdgeAttributesObject = {
  label: 'Edge label',
  color: 'red',
};
```
