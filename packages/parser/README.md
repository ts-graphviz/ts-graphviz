[![NodeCI](https://github.com/ts-graphviz/parser/workflows/NodeCI/badge.svg)](https://github.com/ts-graphviz/parser/actions?workflow=NodeCI)
[![npm version](https://badge.fury.io/js/%40ts-graphviz%2Fparser.svg)](https://badge.fury.io/js/%40ts-graphviz%2Fparser)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg)](#contributors)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

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

### `function parse(dot: string, options?: ParseOption)`

Parse a string written in dot language and convert it to a model.

The returned values are [ts-graphviz](https://github.com/ts-graphviz/ts-graphviz) models
such as `Digraph`, `Graph`, `Node`, `Edge`, `Subgraph`.

- Parameters
  - `dot` -- string in the dot language to be parsed.
  - `options.rule` -- Object type of dot string.
    - This can be `"graph"`, `"subgraph"`, `"node"`, `"edge"`.

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

### Example: parse as Node instance

```ts
import { Node } from 'ts-graphviz';
import { parse } from '@ts-graphviz/parser';

const node = parse(
  `test [
    style=filled;
    color=lightgrey;
    label = "example #1";
  ];`,
  { rule: 'node' },
);

console.log(node instanceof Node);
// true
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

## Low level API

### `AST` module

The `AST` module provides the ability to handle the AST as a result of parsing the dot language
for lower level operations.

#### `function AST.parse(dot: string, options?: ParseOption)`

The basic usage is the same as the `parse` function, except that it returns the dot language AST.

- Parameters
  - `dot` -- string in the dot language to be parsed.
  - `options.rule` -- Object type of dot string.
    - This can be `"graph"`, `"subgraph"`, `"node"`, `"edge"`, `"attributes"`, `"attribute", "cluster_statements"`.

```ts
import { AST } from '@ts-graphviz/parser';

const ast = AST.parse(`
  digraph example {
    node1 [
      label = "My Node",
    ]
  }
`);

console.log(ast);
// {
//   type: 'dot',
//   body: [
//     {
//       type: 'graph',
//       id: {
//         type: 'literal',
//         value: 'example',
//         quoted: false,
//         location: {
//           start: { offset: 11, line: 2, column: 11 },
//           end: { offset: 18, line: 2, column: 18 }
//         }
//       },
//       directed: true,
//       strict: false,
//       body: [
//         {
//           type: 'node',
//           id: {
//             type: 'literal',
//             value: 'node1',
//             quoted: false,
//             location: {
//               start: { offset: 25, line: 3, column: 5 },
//               end: { offset: 30, line: 3, column: 10 }
//             }
//           },
//           body: [
//             {
//               type: 'attribute',
//               key: {
//                 type: 'literal',
//                 value: 'label',
//                 quoted: false,
//                 location: {
//                   start: { offset: 39, line: 4, column: 7 },
//                   end: { offset: 44, line: 4, column: 12 }
//                 }
//               },
//               value: {
//                 type: 'literal',
//                 value: 'My Node',
//                 quoted: true,
//                 location: {
//                   start: { offset: 47, line: 4, column: 15 },
//                   end: { offset: 56, line: 4, column: 24 }
//                 }
//               },
//               location: {
//                 start: { offset: 39, line: 4, column: 7 },
//                 end: { offset: 57, line: 4, column: 25 }
//               }
//             }
//           ],
//           location: {
//             start: { offset: 25, line: 3, column: 5 },
//             end: { offset: 63, line: 5, column: 6 }
//           }
//         }
//       ],
//       location: {
//         start: { offset: 3, line: 2, column: 3 },
//         end: { offset: 67, line: 6, column: 4 }
//       }
//     }
//   ],
//   location: {
//     start: { offset: 3, line: 2, column: 3 },
//     end: { offset: 68, line: 7, column: 1 }
//   }
// }
```

##### Example: Specifying the `rule` option

```ts
const ast = AST.parse('test [ style=filled; ];', { rule: 'node' });

console.log(ast);
// {
//   type: 'node',
//   id: {
//     type: 'literal',
//     value: 'test',
//     quoted: false,
//     location: {
//       start: { offset: 0, line: 1, column: 1 },
//       end: { offset: 4, line: 1, column: 5 }
//     }
//   },
//   body: [
//     {
//       type: 'attribute',
//       key: {
//         type: 'literal',
//         value: 'style',
//         quoted: false,
//         location: {
//           start: { offset: 7, line: 1, column: 8 },
//           end: { offset: 12, line: 1, column: 13 }
//         }
//       },
//       value: {
//         type: 'literal',
//         value: 'filled',
//         quoted: false,
//         location: {
//           start: { offset: 13, line: 1, column: 14 },
//           end: { offset: 19, line: 1, column: 20 }
//         }
//       },
//       location: {
//         start: { offset: 7, line: 1, column: 8 },
//         end: { offset: 20, line: 1, column: 21 }
//       }
//     }
//   ],
//   location: {
//     start: { offset: 0, line: 1, column: 1 },
//     end: { offset: 23, line: 1, column: 24 }
//   }
// }
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

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://blog.kamiazya.tech/"><img src="https://avatars.githubusercontent.com/u/35218186?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Yuki Yamazaki</b></sub></a><br /><a href="https://github.com/ts-graphviz/parser/commits?author=kamiazya" title="Code">💻</a> <a href="https://github.com/ts-graphviz/parser/commits?author=kamiazya" title="Documentation">📖</a> <a href="https://github.com/ts-graphviz/parser/commits?author=kamiazya" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/ChristianMurphy"><img src="https://avatars.githubusercontent.com/u/3107513?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Christian Murphy</b></sub></a><br /><a href="https://github.com/ts-graphviz/parser/commits?author=ChristianMurphy" title="Code">💻</a> <a href="#ideas-ChristianMurphy" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/ts-graphviz/parser/commits?author=ChristianMurphy" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## License

This software is released under the MIT License, see [LICENSE](./LICENSE).
