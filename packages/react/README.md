[![NodeCI](https://github.com/ts-graphviz/react/workflows/NodeCI/badge.svg)](https://github.com/kamiazya/ts-graphviz/actions?workflow=NodeCI)
[![npm version](https://badge.fury.io/js/%40ts-graphviz%2Freact.svg)](https://badge.fury.io/js/%40ts-graphviz%2Freact)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

# @ts-graphviz/react

Graphviz-dot Renderer using React.

## Installation

The module can then be installed using [npm](https://www.npmjs.com/):

[![NPM](https://nodei.co/npm/@ts-graphviz/react.png)](https://nodei.co/npm/@ts-graphviz/react/)

```bash
# yarn
$ yarn add @ts-graphviz/react
# or npm
$ npm install @ts-graphviz/react
```

### Peer Dependencies

- [React and ReactDOM](https://github.com/facebook/react/)(>=16.8)
- [ts-graphviz](https://github.com/ts-graphviz/ts-graphviz)
- [@hpcc-js/wasm](https://www.npmjs.com/package/@hpcc-js/wasm) (Optional)

```bash
# Peer Dependencies
$ yarn add react react-dom ts-graphviz@"^0.12.0"
# Optional Peer Dependencies
$ yarn add @hpcc-js/wasm
```

## DEMO

- [Storybook](https://ts-graphviz.github.io/react/)

## API

### Script

```tsx
import React, { FC } from 'react';
import { Digraph, Node, Subgraph, Edge, DOT, renderToDot } from '@ts-graphviz/react';

const Example: FC = () => (
  <Digraph
    rankdir="TB"
    edge={{
      color: 'blue',
      fontcolor: 'blue',
    }}
    node={{
      shape: 'none',
    }}
  >
    <Node
      id="nodeA"
      shape="none"
      label={
        <DOT.TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
          <DOT.TR>
            <DOT.TD>left</DOT.TD>
            <DOT.TD PORT="m">middle</DOT.TD>
            <DOT.TD PORT="r">right</DOT.TD>
          </DOT.TR>
        </DOT.TABLE>
      }
    />

    <Subgraph id="cluster" label="Cluster" labeljust="l">
      <Node id="nodeB" label="This is label for nodeB." />
    </Subgraph>
    <Edge targets={['nodeB', 'nodeA:m']} comment="Edge from node A to B" label={<DOT.B>A to B</DOT.B>} />
  </Digraph>
);

const dot = renderToDot(<Example />);

console.log(dot);
```

### Output dot

```dot
digraph {
  rankdir = "TB";
  edge [
    color = "blue",
    fontcolor = "blue",
  ];
  node [
    shape = "none",
  ];
  "nodeA" [
    shape = "none",
    label = <<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0"><TR><TD>left</TD><TD PORT="m">middle</TD><TD PORT="r">right</TD></TR></TABLE>>,
  ];
  subgraph "cluster" {
    labeljust = "l";
    label = "Cluster";
    "nodeB" [
      label = "This is label for nodeB.",
    ];
  }
  // Edge from node A to B
  "nodeB" -> "nodeA":"m" [
    label = <<B>A to B</B>>,
  ];
}
```

![dot](./example/example.svg)

### Web

The `Graphviz` component can be rendered directly in the browser.

Since this component uses the function of `@hpcc-js/wasm` internally, it is necessary to host `@hpcc-js/wasm/dist/graphviz.wasm` and specify its directory with `wasmFolder`.

For development, I recommend using the one hosted by unpkg.

```tsx
import React, { FC } from 'react';
import ReactDOM from 'react-dom';
import { Graphviz, Digraph, Node, Edge } from '@ts-graphviz/react';
import { wasmFolder } from '@hpcc-js/wasm';

wasmFolder('https://unpkg.com/@hpcc-js/wasm/dist/');

const App: FC = () => (
  <Graphviz>
    <Digraph>
      <Node id="n1" />
      <Node id="n2" />
      <Node id="n3" />
      <Edge targets={['n1', 'n2', 'n3']} />
      <Edge targets={['n1', 'n3']} />
    </Digraph>
  </Graphviz>
);

ReactDOM.render(<App />, document.getElementById('root'));
```

## See Also

Graphviz-dot Test and Integration

- [ts-graphviz](https://github.com/ts-graphviz/ts-graphviz)
  - Graphviz library for TypeScript.
- [jest-graphviz](https://github.com/ts-graphviz/jest-graphviz)
  - Jest matchers that supports graphviz integration.
- [setup-graphviz](https://github.com/ts-graphviz/setup-graphviz)
  - GitHub Action to set up Graphviz cross-platform(Linux, macOS, Windows).

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://blog.kamiazya.tech/"><img src="https://avatars0.githubusercontent.com/u/35218186?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Yuki Yamazaki</b></sub></a><br /><a href="https://github.com/ts-graphviz/react/commits?author=kamiazya" title="Code">💻</a> <a href="https://github.com/ts-graphviz/react/commits?author=kamiazya" title="Tests">⚠️</a> <a href="#ideas-kamiazya" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/ts-graphviz/react/commits?author=kamiazya" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/nagasawaryoya"><img src="https://avatars.githubusercontent.com/u/53528726?v=4?s=100" width="100px;" alt=""/><br /><sub><b>nagasawaryoya</b></sub></a><br /><a href="https://github.com/ts-graphviz/react/commits?author=nagasawaryoya" title="Code">💻</a> <a href="https://github.com/ts-graphviz/react/commits?author=nagasawaryoya" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/tokidrill"><img src="https://avatars.githubusercontent.com/u/42460318?v=4?s=100" width="100px;" alt=""/><br /><sub><b>YukiSasaki</b></sub></a><br /><a href="https://github.com/ts-graphviz/react/commits?author=tokidrill" title="Code">💻</a> <a href="https://github.com/ts-graphviz/react/commits?author=tokidrill" title="Tests">⚠️</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors)
specification. Contributions of any kind welcome!

## License

This software is released under the MIT License, see [LICENSE](./LICENSE).
