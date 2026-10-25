---
description: How to install ts-graphviz and start creating graphs quickly.
---
# Installation

## Node.js

This package can then be installed using a package manager.

```bash npm2yarn
npm install ts-graphviz
```

TypeScript users need **TypeScript 5.0 or later** (see [Versioning Policy](../11-advanced-topics/03-versioning-policy.md#supported-typescript-versions)).

## Deno

You can install and use the package by specifying the following:

```ts no-check
import { toDot } from 'npm:ts-graphviz';
```

:::info
[Deno v1.28 and above supports npm](https://deno.land/manual/node/npm_specifiers).
:::
