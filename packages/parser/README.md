[![NodeCI](https://github.com/ts-graphviz/parser/workflows/NodeCI/badge.svg)](https://github.com/ts-graphviz/parser/actions?workflow=NodeCI)
[![npm version](https://badge.fury.io/js/%40ts-graphviz%2Fparser.svg)](https://badge.fury.io/js/%40ts-graphviz%2Fparser)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

# @ts-graphviz/parser

Graphviz dot language parser for ts-graphviz.

## Installation

The module can then be installed using [npm](https://www.npmjs.com/):

[![NPM](https://nodei.co/npm/@ts-graphviz/parser.png)](https://nodei.co/npm/@ts-graphviz/parser/)

```bash
# yarn
$ yarn add @ts-graphviz/parser
# or npm
$ npm install -S @ts-graphviz/parser
```

## High level API

### `parse` function

Parse a string written in dot language and convert it to a model.

The return value is a `Graph` or `Digraph` that inherits from `RootCluster`.

```ts
import { parse } from '@ts-graphviz/parser';

const G = parse(`
digraph hoge {
  a -> b;
}`);
```

This is equivalent to the code below when using ts-graphviz.

```ts
import { digraph } from 'ts-graphviz';

const G = digraph('hoge', (g) => {
  g.edge(['a', 'b']);
});
```

If the given string is invalid, a SyntaxError exception will be thrown.

```ts
import { parse, SyntaxError } from '@ts-graphviz/parser';

try {
  parse(`invalid`);
} catch (e) {
  if (e instanceof SyntaxError) {
    console.log(e.message);
  }
}
```

### `dot` tagged template

> This is an experimental API.
> Behavior may change in the future.

A tag template version of the parse function.

Returns a Graph or Digraph object based on the parsed result.

If the given string is invalid, a SyntaxError exception will be thrown.

```ts
import { dot } from '@ts-graphviz/parser';

const G = dot`
  graph {
    a -- b
  }
`;
```

## Low lebel API

### `AST` module

The `AST` module provides the ability to handle the AST as a result of parsing the dot language
for lower level operations.

#### `AST.parse` function

The basic usage is the same as the `parse` function, except that it returns the dot language AST.

```ts
import { inspect } from 'util';
import { AST } from '@ts-graphviz/parser';

const ast = AST.parse(`
  strict digraph example {
    subgraph cluster_0 {
      label="Subgraph A";
      a -> b -> c -> d;
    }

    subgraph cluster_1 {
      label="Subgraph B";
      a -> f;
      f -> c;
    }
  }
`);

console.log(inspect(ast, false, 6));
```

In the case of the above code, the structure of AST is as follows.

```ts
{
  type: 'graph',
  id: 'example',
  directed: true,
  strict: true,
  children: [
    {
      type: 'subgraph',
      id: 'cluster_0',
      children: [
        { type: 'attribute', key: 'label', value: 'Subgraph A' },
        {
          type: 'edge',
          targets: [ { id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' } ],
          attributes: []
        }
      ]
    },
    {
      type: 'subgraph',
      id: 'cluster_1',
      children: [
        { type: 'attribute', key: 'label', value: 'Subgraph B' },
        {
          type: 'edge',
          targets: [ { id: 'a' }, { id: 'f' } ],
          attributes: []
        },
        {
          type: 'edge',
          targets: [ { id: 'f' }, { id: 'c' } ],
          attributes: []
        }
      ]
    }
  ]
}
```

## See Also

Graphviz-dot Test and Integration

- [ts-graphviz](https://github.com/ts-graphviz/ts-graphviz)
  - Graphviz library for TypeScript.
- [@ts-graphviz/react](https://github.com/ts-graphviz/react)
  - Graphviz-dot Renderer using React.
- [jest-graphviz](https://github.com/ts-graphviz/jest-graphviz)
  - Jest matchers that supports graphviz integration.
- [setup-graphviz](https://github.com/ts-graphviz/setup-graphviz)
  - GitHub Action to set up Graphviz cross-platform(Linux, macOS, Windows).

## License

This software is released under the MIT License, see [LICENSE](./LICENSE).
