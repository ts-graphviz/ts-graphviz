[![GitHub Action](https://github.com/kamiazya/ts-graphviz/workflows/NodeCI/badge.svg)](https://github.com/kamiazya/ts-graphviz/actions?workflow=NodeCI) [![npm version](https://badge.fury.io/js/ts-graphviz.svg)](https://badge.fury.io/js/ts-graphviz) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier) [![Maintainability](https://api.codeclimate.com/v1/badges/12a586dde710859d58c7/maintainability)](https://codeclimate.com/github/kamiazya/ts-graphviz/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/12a586dde710859d58c7/test_coverage)](https://codeclimate.com/github/kamiazya/ts-graphviz/test_coverage) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

# ts-graphviz

[Graphviz](https://graphviz.gitlab.io/) library for TypeScript.

## Key Feature

- Export Dot language.
- Support Node.js and Browser.
  - UMD, ESM, CommonJS
- No dependency.

## Installation

The plugin can then be installed using [npm](https://www.npmjs.com/):

[![NPM](https://nodei.co/npm/ts-graphviz.png)](https://nodei.co/npm/ts-graphviz/)

### Package manager

```bash
# yarn
yarn add ts-graphviz
# or npm
npm install ts-graphviz
```

### Browser

```html
<script src="//unpkg.com/ts-graphviz/lib/bundle.min.js"></script>
```

## Usage

### Script

```typescript
import { digraph } from 'ts-graphviz';

const g = digraph('G');

const subgraphA = g.createSubgraph('A');
const nodeA1 = subgraphA.createNode('A_node1');
const nodeA2 = subgraphA.createNode('A_node2');
subgraphA.createEdge(nodeA1, nodeA2);

const subgraphB = g.createSubgraph('B');
const nodeB1 = subgraphB.createNode('B_node1');
const nodeB2 = subgraphB.createNode('B_node2');
subgraphA.createEdge(nodeB1, nodeB2);

const node1 = g.createNode('node1');
const node2 = g.createNode('node2');
g.createEdge(node1, node2);
const dot = g.toDot();
console.log(dot);
```

### Callback style API

```typescript
import { digraph } from 'ts-graphviz';

const G = digraph('G', g => {
  g.subgraph('A', A => {
    const node1 = A.node('A_node1');
    const node2 = A.node('A_node2');
    A.edge([node1, node2]);
  });
  g.subgraph('B', B => {
    const node1 = B.node('B_node1');
    const node2 = B.node('B_node2');
    B.edge([node1, node2]);
  });
  g.edge(['node1', 'node2']);
});
const dot = G.toDot();
console.log(dot);
```

### Output

```graphviz
digraph "G" {
  "node1";
  "node2";
  subgraph "A" {
    "A_node1";
    "A_node2";
    "A_node1" -> "A_node2";
  }
  subgraph "B" {
    "B_node1";
    "B_node2";
    "B_node1" -> "B_node2";
  }
  "node1" -> "node2";
}
```

## Contributing

For more info on how to contribute to ts-graphviz, see the [docs](./CONTRIBUTING.md).

## See Also

Graphviz-dot Test and Integration

- [jest-graphviz](https://github.com/kamiazya/jest-graphviz)
  - Jest matchers that supports graphviz integration.
- [setup-graphviz](https://github.com/kamiazya/setup-graphviz)
  - GitHub Action to set up Graphviz cross-platform(Linux, macOS, Windows).

## License

This software is released under the MIT License, see LICENSE.

## Author

[kamiazya(Yuki Yamazaki)](https://github.com/kamiazya)

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/W7W5VDNO)
