---
description: |-
  Upgrade your ts-graphviz project from v0 to v1 with our comprehensive migration guide. Learn about the shift to an AST-centered design, interface renaming, and how to update your code for enhanced performance and type safety.
---
# Migration from v0 to v1

## Overview of Changes

In the transition from ts-graphviz v0 to v1, significant changes were made to the library's architecture and APIs:

- **Shift to AST-Centered Design**: Modules around the Abstract Syntax Tree (AST) were integrated, consolidating functions related to stringifying models to DOT language.
- **Introduction of `ts-graphviz/ast` Module**: The `@ts-graphviz/parser` package was integrated into the `ts-graphviz/ast` module, providing AST-related processing such as `parse` and `stringify` functions.
- **Attribute Types**: Type definitions for various attributes were introduced, allowing for better editor assistance and TypeScript checks when specifying attributes.
- **Interface Naming Conventions**: Ambiguities in interface naming were resolved. Interfaces prefixed with `I` (e.g., `ICluster`) were renamed to have consistent naming with the AST types.


## Why Upgrade?

Upgrading to v1 provides several benefits:

- **Unified AST Handling**: Integrating AST modules improves performance and simplifies the manipulation of graphs at the AST level.
- **Enhanced Type Safety**: With the introduction of attribute types, you get better type checking and IntelliSense support in your IDE.
- **Consistent Naming**: The new naming conventions make the library more intuitive and consistent, reducing confusion.

## Migration Steps


### 1. Update Dependencies

Update the `ts-graphviz` package to version 1 in your `package.json`:


```json
{
  "dependencies": {
    "ts-graphviz": "^1.0.0"
  }
}
```

Then run:

```sh
npm install ts-graphviz@^1.0.0
```

### 2. Update Interface Names

The interface names have changed. Update your code as follows:

- `INode` ➔ `NodeModel`
- `IEdge` ➔ `EdgeModel`
- `ICluster` ➔ `GraphBaseModel` (deprecated, use `GraphModel` or `SubgraphModel`)
- `ISubgraph` ➔ `SubgraphModel`
- `IRootCluster` ➔ `RootGraphModel`

**Example:**

```diff
- import { INode } from 'ts-graphviz';
+ import { NodeModel } from 'ts-graphviz';

- const node: INode = ...;
+ const node: NodeModel = ...;
```

### 3. Use the New `ts-graphviz/ast` Module

If you were using `@ts-graphviz/parser`, migrate to the new `ts-graphviz/ast` module.

**Example:**

```diff
- import { parse, stringify } from '@ts-graphviz/parser';
+ import { parse, stringify } from 'ts-graphviz/ast';

const dot = 'digraph { a -> b }';
const ast = parse(dot);
// Manipulate AST...
const newDot = stringify(ast);
```

### 4. Update Attribute Usage

With the introduction of attribute types, you can now import specific attribute keys and values.

**Example:**

```typescript
import { attribute } from 'ts-graphviz';

g.node('Node1', {
  [attribute.label]: 'My Node',
  [attribute.color]: 'red',
});
```
