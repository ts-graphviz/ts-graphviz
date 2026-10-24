---
description: Package architecture of ts-graphviz.
---
# Package Architecture

**ts-graphviz** consists of several packages, each with a specific role:

- **`ts-graphviz`** (Main Package): Provides high-level APIs for creating and manipulating graphs, suitable for most users.

- **`@ts-graphviz/core`**: Contains core implementations of models and functions, used internally and available for advanced use.

- **`@ts-graphviz/common`**: Aggregates Graphviz domain knowledge, providing type definitions, constants, and utilities. Supports use cases like extending custom types and attributes.

- **`@ts-graphviz/ast`**: Offers tools for parsing, manipulating, and generating DOT language graphs at the AST level.

- **`@ts-graphviz/adapter`**: Executes Graphviz commands in various runtime environments (Node.js, Deno) and converts DOT strings to images.

- **`@ts-graphviz/react`**: Allows defining graphs using React's declarative UI paradigm, expressing DOT language models with JSX.

## Exposing Internal Modules as Submodules

**ts-graphviz** publishes some of its internal modules as submodules within the main package. Specifically, the following import paths are available to access these internal modules:

- **`ts-graphviz/ast`** or **`@ts-graphviz/ast`**
- **`ts-graphviz/adapter`** or **`@ts-graphviz/adapter`**

This allows users to choose the module import style that best fits their project's needs. By using the `ts-graphviz/<module-name>` style, you can limit your dependencies to the `ts-graphviz` library itself, with internal packages (e.g., `@ts-graphviz/adapter`, `@ts-graphviz/ast`) being managed centrally by the `ts-graphviz` package. On the other hand, using the `@ts-graphviz/<module-name>` style enables you to manage dependencies on a per-module basis, allowing you to selectively install specific modules as needed.

:::tip Managing Dependencies When Choosing Import Paths

When using package managers that enforce strict dependency management (e.g., pnpm), the choice of import path can significantly impact how dependencies are handled. Consider the following points:

- **Using `ts-graphviz/<module-name>` Style**:
  - **Advantages**: Limits dependencies to the `ts-graphviz` library itself, with internal packages (e.g., `@ts-graphviz/adapter`, `@ts-graphviz/ast`) being managed centrally by the `ts-graphviz` package. This prevents dependency conflicts and ensures that stable versions recommended by the library are used.
  - **Recommended Scenarios**: When you want to minimize dependencies or when the internal packages managed by `ts-graphviz` do not have specific version requirements.

- **Using `@ts-graphviz/<module-name>` Style**:
  - **Advantages**: Allows you to manage dependencies on a per-module basis, installing only the specific modules you need, which can help keep your application lightweight.
  - **Caveats**: Requires you to manage internal dependencies (e.g., `@ts-graphviz/adapter`, `@ts-graphviz/ast`) separately within your package manager. This can complicate version management.
  - **Recommended Scenarios**: When you need to use specific modules only or require detailed control over your dependencies.

**Summary**:
- If you prefer **simple dependency management**, use the `ts-graphviz/<module-name>` style.
- If you require **fine-grained control over dependencies** or only need specific modules, opt for the `@ts-graphviz/<module-name>` style.

This approach allows you to manage dependencies in a way that best suits your project's requirements.
:::


The relationships between packages can be visualized as follows:

![Package dependency graph showing relationships between ts-graphviz packages and their dependencies](./img/dependency-graph.svg)

This modular architecture ensures:

- **Maintainability**: Individual packages can be maintained and updated without affecting others.

- **Flexibility**: Users can select only the packages needed for their specific use cases.

- **Extensibility**: Facilitates the addition of new features or packages as the library evolves.
