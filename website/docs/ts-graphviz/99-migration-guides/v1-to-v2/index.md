---
description: |-
  Upgrade your ts-graphviz project from v1 to v2 with our updated migration guide. Learn about the latest improvements, Node.js version update, and how to maintain compatibility with minimal changes. Discover how to update your project while keeping your import paths and dependencies largely the same.
---
# Migration from v1 to v2

## Overview of Changes

Version 2 of ts-graphviz introduces significant updates:

- **Package Splitting and Monorepo Structure**: The library is now divided into multiple packages for better modularity and maintainability. However, to maintain backward compatibility, the `ts-graphviz` package continues to provide the same functionality, including modules like `ts-graphviz/adapter` and `ts-graphviz/ast`.
- **Dropping Support for Node.js 14 & 16**: The minimum required Node.js version is now **Node.js 18**.
- **Updated Development Tools**: Migration to `pnpm`, use of `vite` and `vitest` for building and testing, and adoption of `biome` for linting and formatting.
- **API Changes**: Removal of beta and alpha APIs like `ModelContext`.

## Why Upgrade?

Upgrading to v2 ensures:

- **Better Performance and Security**: By supporting the latest Node.js LTS version.
- **Improved Modularity**: The library is more modular, allowing for better maintainability and flexibility.
- **Enhanced Development Experience**: Updated tools offer a smoother workflow.
- **Future-Proofing**: Aligns with the latest JavaScript ecosystem improvements.

## Migration Steps {#migration-steps-v1-v2}

### 1. Update Node.js Version

Ensure your environment is running **Node.js 18** or later.

**Check Node.js Version:**

```sh
node -v
```

**If necessary, update Node.js via [official instructions](https://nodejs.org/en/download/) or use a version manager like `nvm`.**

### 2. Update Dependencies

Update the `ts-graphviz` package to version 2 in your `package.json`:

```json
{
  "dependencies": {
    "ts-graphviz": "^2.0.0"
  }
}
```

Then run:

```sh
npm install ts-graphviz@^2.0.0
```

### 3. Verify Import Paths

If you are using modules like `ts-graphviz/adapter` or `ts-graphviz/ast`, you can continue to use them as before through the `ts-graphviz` package.

**Example:**

```typescript
import { digraph } from 'ts-graphviz';
import { toFile } from 'ts-graphviz/adapter';
import { parse } from 'ts-graphviz/ast';
```

### 4. Optional: Use Specific Packages

If you only need specific functionality and wish to minimize dependencies, you can depend directly on the specific packages:

- `@ts-graphviz/adapter`
- `@ts-graphviz/ast`
- `@ts-graphviz/common`

**Example:**

```json
{
  "dependencies": {
    "@ts-graphviz/ast": "^2.0.0"
  }
}
```

And import:

```typescript
import { parse } from '@ts-graphviz/ast';
```

### 5. Migrate Type System Extensions

If you extended the type system, update import paths from `ts-graphviz` to `@ts-graphviz/common`.

**Example:**

```diff
- import { $keywords } from 'ts-graphviz';
+ import { $keywords } from '@ts-graphviz/common';
```

### 6. Update Removed APIs

APIs provided in beta and alpha, like `ModelContext`, have been removed. Refactor your code to avoid using these APIs.

:::note Policy Change and Differences
In previous guidance, we recommended changing imports from `ts-graphviz/adapter` to `@ts-graphviz/adapter` and adding `@ts-graphviz/adapter` to your dependencies. However, we have decided to maintain backward compatibility within the `ts-graphviz` package. You can continue to use `ts-graphviz/adapter` and `ts-graphviz/ast` modules as before, without changing your import paths or adding new dependencies.

This approach reduces migration costs and aligns with modern package management practices, especially with strict dependency management tools like `pnpm`.

For users who only need specific functionality and wish to minimize dependencies, we encourage you to depend directly on the specific packages (`@ts-graphviz/adapter`, `@ts-graphviz/ast`, etc.) to keep your application lightweight.
:::
