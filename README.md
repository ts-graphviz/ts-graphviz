# ts-graphviz Monorepo

This repository contains the ts-graphviz library and its associated packages, organized as a monorepo for improved maintainability, collaboration, and ease of use.

ts-graphviz is a TypeScript library for working with Graphviz DOT language, providing a modular and extensible way to create, manipulate, and render graph data.

## Features

- Create and manipulate graphs, nodes, and edges using an object-oriented API
- Parse and generate DOT language with AST
- Adapter function implementations for various environments, such as Node.js Deno, and browser(not implemented)
- Extensible design for custom functionality
- Type definitions for DOT language elements

## Key Concepts

ts-graphviz is a TypeScript library designed to create, manipulate, and render Graphviz DOT language graphs. It is built around several key concepts that make it modular, extensible, and easy to use:

- **TypeScript-First Design & Type Definitions**: ts-graphviz is designed with TypeScript as its primary language, providing strong typing and ensuring seamless integration with TypeScript projects. This enables users to leverage the full power of TypeScript's type system and tooling while working with Graphviz graphs. The library includes comprehensive type definitions for DOT language elements, making it easier to work with Graphviz elements in a type-safe manner.

- **Object-Oriented API**: ts-graphviz provides an object-oriented API for creating and manipulating graph elements like graphs, nodes, and edges. This enables users to work with complex graph structures intuitively and efficiently.

- **Modular Design**: The library is split into multiple packages, each serving a specific purpose. This modular design allows users to pick and choose the functionality they need, resulting in improved maintainability and flexibility.

- **AST Support**: ts-graphviz includes a module for processing DOT language at the Abstract Syntax Tree (AST) level. This feature allows users to parse and generate DOT language while preserving its structure, making it easier to manipulate and transform graphs programmatically.

- **Runtime Adapter**: The library provides adapter functions that enable users to execute Graphviz commands across different runtime environments, such as Node.js and Deno. These adapter functions serve as a wrapper, allowing for seamless integration with various platforms.

- **Extensibility**: ts-graphviz has been designed with extensibility in mind, allowing users to extend its functionality with custom implementations for specific use cases.

- **Multi-Paradigm Support**: ts-graphviz is designed to accommodate various programming paradigms, such as Object-Oriented Programming, Declarative Programming, and Functional Programming. This ensures that users can choose the programming style that best suits their needs and preferences, making it adaptable and versatile across different use cases and development approaches.

By combining these key concepts, ts-graphviz aims to provide a powerful and user-friendly tool for working with Graphviz DOT language in TypeScript projects.

## Packages

ts-graphviz consists of the following packages:

1. **ts-graphviz**: To ensure that existing users are not affected, the ts-graphviz package will remain available.

2. **@ts-graphviz/common**: Contains type information related to DOT language attributes, attribute values, and models.

3. **@ts-graphviz/ast**: Includes the module for processing DOT language at the AST (Abstract Syntax Tree) level.

4. **@ts-graphviz/core**: Comprises the implementation of models and functions provided to users.

5. **@ts-graphviz/adapter**: Handles runtime-dependent processing, such as input/output processing and Renderer implementations for different environments.

For installation and usage instructions, please refer to the README of each package.

## Getting Started

To get started with ts-graphviz, please refer to the documentation and examples provided in each package. You can find the README files for each package in their respective directories.

## Contributing

Contributions to the ts-graphviz project are welcome. Please see the [CONTRIBUTING.md](./CONTRIBUTING.md) file for guidelines on how to contribute.

## License

ts-graphviz is released under the MIT License.
