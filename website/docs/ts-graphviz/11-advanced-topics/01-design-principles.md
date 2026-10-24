---
description: Design principles of ts-graphviz.
---
# Design Principles

**ts-graphviz** is built around several key concepts that make it modular, extensible, and easy to use:

1. **TypeScript-First Design & Type Definitions**

    **ts-graphviz** is designed primarily with TypeScript in mind, offering strong typing and seamless integration with TypeScript projects. Comprehensive type definitions for DOT language elements enable type-safe interactions, enhancing development efficiency and reducing errors.

1. **Object-Oriented API**

    The library provides an object-oriented API for creating and manipulating graph elements such as graphs, nodes, and edges. This approach makes working with complex graph structures intuitive and efficient, leveraging familiar programming paradigms.

1. **Modular Design**

    **ts-graphviz** adopts a modular architecture, split into multiple packages, each serving a specific purpose. This modularity allows users to include only the functionality they need, improving maintainability, flexibility, and reducing unnecessary dependencies.

1. **AST Support**

    The library includes support for Abstract Syntax Trees (AST) for processing the DOT language. This enables parsing and generating DOT language while preserving its structure, facilitating programmatic manipulation and transformation of graphs.

1. **Runtime Adapter**

    To ensure compatibility across different runtime environments, **ts-graphviz** provides adapter functions for environments like Node.js and Deno. These adapters serve as a wrapper, enabling seamless execution of Graphviz commands regardless of the underlying platform.

1. **Extensibility**

    Designed with extensibility in mind, **ts-graphviz** allows users to extend its functionality with custom implementations for specific use cases. This flexibility supports a wide range of applications and integration scenarios.

1. **Multi-Paradigm Support**

    The library accommodates various programming paradigms, including Object-Oriented Programming and Declarative Programming. Users can choose the style that best suits their needs, making the library versatile and adaptable.
