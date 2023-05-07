# ts-graphviz

ts-graphviz is a TypeScript library for working with Graphviz DOT language, providing a modular and extensible way to create, manipulate, and render graph data.

It is split into several packages to improve maintainability, flexibility, and ease of use.

## Features

- Create and manipulate graphs, nodes, and edges using an object-oriented API
- Parse and generate DOT language with AST
- Adapter function implementations for various environments, such as Node.js Deno, and browser(not implemented)
- Extensible design for custom functionality
- Type definitions for DOT language elements

## Installation 💽

### Node.js

To install the `ts-graphviz` package, use your favorite package manager:

```bash
# npm
$ npm install -S ts-graphviz
# or yarn
$ yarn add ts-graphviz
# or pnpm
$ pnpm add ts-graphviz
```

> **Note** Want to try before installing? Check out [Runkit](https://npm.runkit.com/ts-graphviz) to see how it works.

### Deno 🦕

#### Using `npm:` specifiers

[Deno v1.28 and above supports npm](https://deno.land/manual/node/npm_specifiers).

You can install and use the package by specifying the following:

```ts
import { } from 'npm:ts-graphviz';
```

#### Using package.json

[Deno v1.31 and above supports package.json](https://deno.com/manual/node/package_json).

You can install and use the package by specifying the following:

- **package.json**
    ```json
    {
      "name": "my-example-project",
      "description": "An example app created with Deno",
      "type": "module",
      "scripts": {
        "dev": "deno run main.ts"
      },
      "dependencies": {
        "ts-graphviz": "^2.0.0"
      }
    }
    ```

- **main.ts**
    ```ts
    import { } from 'npm:ts-graphviz';
    ```

## Contributing

Contributions to the ts-graphviz project are welcome.

Please refer to the main ts-graphviz repository for guidelines on how to contribute.

## License

ts-graphviz is released under the MIT License.
