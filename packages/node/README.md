[![NodeCI](https://github.com/ts-graphviz/node/workflows/NodeCI/badge.svg)](https://github.com/ts-graphviz/node/actions?workflow=NodeCI)
[![npm version](https://badge.fury.io/js/%40ts-graphviz%2Fnode.svg)](https://badge.fury.io/js/%40ts-graphviz%2Fnode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

# @ts-graphviz/node

Graphviz adapter for Node.js.

## Installation

```bash
# yarn
yarn add @ts-graphviz/node
# or npm
npm install @ts-graphviz/node
```

## Usage

### High level API

### `exportToFile` function

Export the file by giving a dot.

```typescript
const dot = 'digraph g { a -> b [label = "Hello World"] }';

await exportToFile(dot, {
  format: "png",
  output: path.resolve(__dirname, "./example.png"),
});
```

> **Note**: Currently supported formats are png, svg, json, jpg, pdf, xdot, plain, and dot_json.
>
> Other formats will be added if requested, so please give me a PR or issue.

### `exportToBuffer` function

Returns the Graphviz output result as a buffer.

```typescript
const dot = 'digraph g { a -> b [label = "Hello World"] }';

const imageBuffer = await exportToBuffer(dot, {
  format: "png",
});
```

### `ts-graphviz` integration

In the high-level API, you can also specify RootCluster such as Digraph or Graph of `ts-graphviz` as an argument and render directly.

```typescript
import path from "path";
import { digraph, attribute } from "ts-graphviz";
import { exportToFile } from "@ts-graphviz/node";

const G = digraph("G", (g) => {
  const a = g.node("aa");
  const b = g.node("bb");
  const c = g.node("cc");
  g.edge([a, b, c], {
    [attribute.color]: "red",
  });
  g.subgraph("A", (A) => {
    const Aa = A.node("Aaa", {
      [attribute.color]: "pink",
    });
    const Ab = A.node("Abb", {
      [attribute.color]: "violet",
    });
    const Ac = A.node("Acc");
    A.edge([Aa.port({ compass: "c" }), Ab, Ac, "E"], {
      [attribute.color]: "red",
    });
  });
});

await exportToFile(G, {
  format: "svg",
  output: path.resolve(__dirname, "./callback.svg"),
});
```

### Low level API

### `executeDot` function

A low-level API for wrappers for dot commands provided by Graphviz.

## See Also

Graphviz-dot Test and Integration

- [ts-graphviz](https://github.com/ts-graphviz/ts-graphviz)
  - [Graphviz](https://graphviz.gitlab.io/) library for TypeScript.
- [@ts-graphviz/react](https://github.com/ts-graphviz/react)
  - Graphviz-dot Renderer for React.
- [@ts-graphviz/mdx](https://github.com/ts-graphviz/mdx)
  - Embed the Graphviz image in MDX.
- [jest-graphviz](https://github.com/ts-graphviz/jest-graphviz)
  - Jest matchers that supports graphviz integration.
- [setup-graphviz](https://github.com/ts-graphviz/setup-graphviz)
  - GitHub Action to set up Graphviz cross-platform(Linux, macOS, Windows).

## License

This software is released under the MIT License, see [LICENSE](./LICENSE).
