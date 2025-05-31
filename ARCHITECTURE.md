# ARCHITECTURE

## Design Principles

### Key Concepts

ts-graphviz is a TypeScript library designed to create, manipulate, and render Graphviz DOT language graphs. It is built around several key concepts that make it modular, extensible, and easy to use:

1. **TypeScript-First Design & Type Definitions**: ts-graphviz is designed with TypeScript as its primary language, providing strong typing and ensuring seamless integration with TypeScript projects. This enables users to leverage the full power of TypeScript's type system and tooling while working with Graphviz graphs. The library includes comprehensive type definitions for DOT language elements, making it easier to work with Graphviz elements in a type-safe manner.

2. **Object-Oriented API**: ts-graphviz provides an object-oriented API for creating and manipulating graph elements like graphs, nodes, and edges. This enables users to work with complex graph structures intuitively and efficiently.

3. **Modular Design**: The library is split into multiple packages, each serving a specific purpose. This modular design allows users to pick and choose the functionality they need, resulting in improved maintainability and flexibility.

4. **AST Support**: ts-graphviz includes a module for processing DOT language at the Abstract Syntax Tree (AST) level. This feature allows users to parse and generate DOT language while preserving its structure, making it easier to manipulate and transform graphs programmatically.

5. **Runtime Adapter**: The library provides adapter functions that enable users to execute Graphviz commands across different runtime environments, such as Node.js and Deno. These adapter functions serve as a wrapper, allowing for seamless integration with various platforms.

6. **Extensibility**: ts-graphviz has been designed with extensibility in mind, allowing users to extend its functionality with custom implementations for specific use cases.

7. **Multi-Paradigm Support**: ts-graphviz is designed to accommodate various programming paradigms, such as Object-Oriented Programming, Declarative Programming, and Functional Programming. This ensures that users can choose the programming style that best suits their needs and preferences, making it adaptable and versatile across different use cases and development approaches.

By combining these key concepts, ts-graphviz aims to provide a powerful and user-friendly tool for working with Graphviz DOT language in TypeScript projects.

### Policies

#### Version Support Policy

To provide a stable and secure library for our users while keeping up with improvements in the JavaScript ecosystem. To achieve this, we have established the following Node.js version support policy for ts-graphviz:

1. **Minimum Guaranteed Version**: We guarantee support for the latest Node.js version that has entered Long Term Support (LTS) at the time of a major release of our library. This ensures that our library benefits from the stability and long-term support provided by LTS versions.

2. **End-of-Life (EOL) Policy**: We will cease support for Node.js versions when they reach their EOL, as defined by the Node.js release schedule. This helps us focus on providing a secure and up-to-date library while minimizing the maintenance burden of supporting outdated versions.

3. **Version Support Communication**: We will clearly communicate our Node.js version support policy in our library's documentation and release notes. When a new major version is released or when a Node.js version enters EOL, we will inform our users through release notes, blog posts, or other relevant channels.

4. **Migration Guides** : When introducing breaking changes due to Node.js version support updates, we will provide migration guides to help our users transition their projects to the new requirements smoothly.

## Packages Architecture

| Package | Version | Summary | Description |
| --- | --- | --- | --- |
| [ts-graphviz](https://www.npmjs.com/package/ts-graphviz) | [![npm](https://img.shields.io/npm/v/ts-graphviz)](https://www.npmjs.com/package/ts-graphviz) | Graphviz library for TypeScript | The main package that serves as the entry point for users. It provides a high-level API for creating, manipulating, and rendering Graphviz DOT language graphs. |
| [@ts-graphviz/common](https://www.npmjs.com/package/@ts-graphviz/common) | [![npm](https://img.shields.io/npm/v/@ts-graphviz/common)](https://www.npmjs.com/package/@ts-graphviz/common) | Graphviz Types and Utilities | Contains type information related to DOT language attributes, attribute values, and models. |
| [@ts-graphviz/ast](https://www.npmjs.com/package/@ts-graphviz/ast) | [![npm](https://img.shields.io/npm/v/@ts-graphviz/ast)](https://www.npmjs.com/package/@ts-graphviz/ast) | Graphviz AST(Abstract Syntax Tree) Utilities | Includes the module for processing DOT language at the AST (Abstract Syntax Tree) level. |
| [@ts-graphviz/core](https://www.npmjs.com/package/@ts-graphviz/core) | [![npm](https://img.shields.io/npm/v/@ts-graphviz/core)](https://www.npmjs.com/package/@ts-graphviz/core) | Graphviz Models for Object-Oriented Programming | Comprises the implementation of models and functions provided to users. |
| [@ts-graphviz/adapter](https://www.npmjs.com/package/@ts-graphviz/adapter) | [![npm](https://img.shields.io/npm/v/@ts-graphviz/adapter)](https://www.npmjs.com/package/@ts-graphviz/adapter) | Graphviz Runtime adapters for Cross Platform | Handles runtime-dependent processing, such as input/output processing and Renderer implementations for different environments. |


![Dependency graph](./media/dependency-graph.svg)

## Environments Support Levels

To provide clarity on the environments in which ts-graphviz operates, we have categorized support levels:

### Tier 1: Full Support

- **Definition**: Environments that are fully supported, with comprehensive automated testing and maintenance.
- **Environments**:
  - **Node.js LTS versions**: All active Long-Term Support (LTS) versions.
    - If a Node.js LTS version is released, we will ensure compatibility with it.
    - If a Node.js LTS version is deprecated, we will drop support for it in the next major release.
- **Details**:
  - We run automated tests on all LTS versions of Node.js.
  - Full compatibility and performance are ensured.
  - Critical issues are prioritized for fixes.

### Tier 2: Active Support

- **Definition**: Environments that receive active support with limited automated testing.
- **Environments**:
  - **Deno Latest LTS version**: The latest Long-Term Support (LTS) version of Deno.
    - If a new Deno LTS version is released, we will ensure compatibility with it.
    - If a Deno LTS version is deprecated, we will drop support for it in the next minor release.
  - **Node.js Current Release**: The latest Node.js release outside the LTS schedule.
    - If a new Node.js current release is available, we will ensure compatibility with it.
    - If a Node.js current release is deprecated, we will drop support for it in the next minor release.
- **Details**:
  - Compatibility is maintained, and issues are addressed.

### Tier 3: Community Support

- **Definition**: Environments that are not officially tested but are supported on a best-effort basis.
- **Environments**:
  - **Modern Browsers**: Latest versions of major browsers, including:
    - Google Chrome
    - Mozilla Firefox
    - Microsoft Edge
    - Apple Safari
  - **Deno Current Release**: The latest Deno release outside the LTS schedule.
- **Details**:
  - Installation methods are provided.
  - No automated testing is performed.
  - Issues reported by users will be addressed.
  - Targeting the latest versions ensures compatibility with modern web standards.
  - We will not actively test or maintain compatibility with older versions of browsers.

