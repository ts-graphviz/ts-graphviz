<div align="center">

[![Main](https://github.com/ts-graphviz/ts-graphviz/actions/workflows/main.yaml/badge.svg)](https://github.com/ts-graphviz/ts-graphviz/actions/workflows/main.yaml)
[![CodeQL](https://github.com/ts-graphviz/ts-graphviz/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/ts-graphviz/ts-graphviz/actions/workflows/codeql-analysis.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/ts-graphviz/ts-graphviz/blob/main/LICENSE)
[![All Contributors](https://img.shields.io/github/all-contributors/ts-graphviz/ts-graphviz?color=orange)](#contributors-)

[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/8396/badge)](https://www.bestpractices.dev/projects/8396)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/ts-graphviz/ts-graphviz/badge)](https://scorecard.dev/viewer/?uri=github.com/ts-graphviz/ts-graphviz)
[![Tidelift](https://tidelift.com/badges/package/npm/ts-graphviz?style=flat)](https://tidelift.com/subscription/pkg/npm-ts-graphviz?utm_source=npm-ts-graphviz&utm_medium=readme)

[![npm version](https://badge.fury.io/js/ts-graphviz.svg)](https://badge.fury.io/js/ts-graphviz)
![node version](https://img.shields.io/node/v/ts-graphviz)
[![deno version](https://img.shields.io/badge/deno-lts-black?logo=deno)](https://github.com/denoland/deno)
[![npm](https://img.shields.io/npm/dm/ts-graphviz)](https://npmtrends.com/ts-graphviz)

# @ts-graphviz/ast

This package contains the module for processing the DOT language at the **A**bstract **S**yntax **T**ree (AST) level for the ts-graphviz library.

🔗

[![GitHub](https://img.shields.io/badge/-GitHub-181717?logo=GitHub&style=flat)](https://github.com/ts-graphviz/ts-graphviz)
[![npm](https://img.shields.io/badge/-npm-CB3837?logo=npm&style=flat)](https://www.npmjs.com/package/ts-graphviz)
[![Reference](https://img.shields.io/badge/-API_Reference-3178C6?logo=TypeScript&style=flat&logoColor=fff)](https://ts-graphviz.github.io/api/)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/ts-graphviz/ts-graphviz)

[![Sponsor](https://img.shields.io/badge/-GitHub%20Sponsor-fff?logo=GitHub%20Sponsors&style=flat)](https://github.com/sponsors/ts-graphviz)
[![OpenCollective](https://img.shields.io/badge/-OpenCollective-7FADF2?logo=opencollective&style=flat&logoColor=white)](https://opencollective.com/ts-graphviz)

[![format: Biome](https://img.shields.io/badge/format%20with-Biome-F7B911?logo=biome&style=flat)](https://biomejs.dev/)
[![test: Vitest](https://img.shields.io/badge/tested%20with-Vitest-6E9F18?logo=vitest&style=flat)](https://vitest.dev/)
[![build: Vite](https://img.shields.io/badge/build%20with-Vite-646CFF?logo=vite&style=flat)](https://vite.dev/)

</div>

---

> It is part of the ts-graphviz library, which is split into modular packages to improve maintainability, flexibility, and ease of use.


## Overview

This package is a foundational component of the ts-graphviz library that enables low-level manipulation of DOT language structures.
It provides a parser that converts DOT language strings into AST nodes and a stringifier that converts AST nodes back to DOT language.

It runs in any JavaScript runtime. The same API is in the `ts-graphviz/ast` entry of the `ts-graphviz` package.

## Main Functions

The AST package provides several key functions:

- `parse(input, options?)`: Parses a DOT language string into an AST structure
- `stringify(ast, options?)`: Converts an AST structure to a DOT language string
- `fromModel(model, options?)`: Converts a Graph Model to an AST structure
- `toModel(ast, { models })`: Converts an AST structure to a Graph Model. `models` is the set of model classes to create, such as `defaultModelsContext()` from `@ts-graphviz/core`
- `sanitize(dot, options?)`: Checks a DOT language string from an untrusted source and returns the DOT to render, or throws

## Usage Examples

### Parsing DOT Language

```ts
import { parse } from "@ts-graphviz/ast";

const dotString = "digraph G { A -> B; }";
const ast = parse(dotString);
console.log(ast.type);
// Dot
const graph = ast.children[0];
if (graph.type === "Graph") {
  console.log(graph.directed, graph.id?.value);
  // true G
}
```

An identifier or a value is a `Literal` node, whose `kind` says how it is written in DOT: `'bare'`, `'quoted'` or `'html'`. `Literal`, `Attribute` and `Comment` nodes are leaves and have no `children`.

#### Parser Options

The `parse` function accepts an optional second argument for configuration:

```ts
import { parse } from "@ts-graphviz/ast";

const dotString = "digraph G { A -> B; }";

// Parse with custom security limits
const ast = parse(dotString, {
  maxNestingDepth: 50,           // Maximum subgraph nesting depth (default: 100)
  maxHtmlNestingDepth: 200,      // Maximum HTML nesting depth (default: 100)
  maxEdgeChainDepth: 2000,       // Maximum edge chain depth (default: 1000)
  maxInputSize: 20971520,        // Maximum input size in bytes (default: 10MB)
  maxASTNodes: 200000            // Maximum AST nodes (default: 100,000)
});
```

**Available Options**:

| Option | Default | Description | `0` disables |
|--------|---------|-------------|--------------|
| `maxNestingDepth` | `100` | Maximum nesting depth of graph and subgraph bodies (`{ … }`); a graph's own body is at depth 1 | No |
| `maxHtmlNestingDepth` | `100` | Maximum depth of nested HTML-like structures | No |
| `maxEdgeChainDepth` | `1000` | Maximum depth of chained edges (e.g., `a -> b -> c -> ...`) | No |
| `maxInputSize` | `10485760` (10MB) | Maximum input size in bytes | Yes |
| `maxASTNodes` | `100000` | Maximum number of AST nodes to create | Yes |
| `filename` | none | A name for the source, used to identify it | |

The depth limits can be changed but not disabled. For every limit, a value that cannot be used (`NaN`, a negative number) gives the default.

To read a fragment of a DOT source rather than a whole one, say what to read it as with `as`; the result is typed by it, and the same limits apply. (`startRule` is a deprecated alias of `as`.)

```ts
import { parse } from "@ts-graphviz/ast";

const edge = parse('a -> b [color=red]', { as: 'Edge' });
const statements = parse('a; b -> c; rank=same', { as: 'ClusterStatements' });
```

**Security Note**:

These limits protect against denial-of-service attacks:

- **`maxNestingDepth`**: Prevents stack overflow from deeply nested subgraphs
  - Example dangerous input: `digraph { { { { ... } } } }`

- **`maxHtmlNestingDepth`**: Prevents stack overflow from deeply nested HTML-like structures
  - Normal use cases: typically <10 levels
  - HTML-like labels are GraphViz DOT syntax, not browser HTML

- **`maxEdgeChainDepth`**: Prevents stack overflow from deeply chained edges
  - Example dangerous input: `a -> b -> c -> ... -> z (1000+ nodes)`

- **`maxInputSize`**: Prevents memory exhaustion from extremely large files
  - Default 10MB is sufficient for most legitimate graphs
  - Can be increased for known large graphs or disabled with `0` (not recommended for untrusted input)

- **`maxASTNodes`**: Prevents memory exhaustion from inputs with excessive elements
  - Each DOT element creates multiple AST nodes
  - Example: A single node statement (`node1;`) creates ~2-3 AST nodes
  - Can be disabled with `0` (not recommended for untrusted input)

The conversions have limits of their own: `fromModel` takes `maxASTNodes`, `toModel` takes `maxEdgeTargets` and `maxSharedNodes`, and `stringify` takes `maxSharedNodes` (each `100000` by default, and disabled with `0`). An AST that contains itself is always rejected.

**Important**: When processing untrusted DOT files (e.g., user uploads), keep these limits enabled with conservative values appropriate for your environment. For additional validation of untrusted content, see the validation guide in [@ts-graphviz/adapter documentation](https://github.com/ts-graphviz/ts-graphviz/blob/main/packages/adapter/README.md#security-considerations).

### Generating DOT Language

```ts
import { parse, stringify } from "@ts-graphviz/ast";

const dotString = "digraph G { A -> B; }";
const ast = parse(dotString);
// Modify the AST if needed
const outputDotString = stringify(ast);
console.log(outputDotString);
// digraph G {
//   A -> B;
// }
```

### Converting between AST and Model

`toModel` creates the models with the classes of a models context, which `@ts-graphviz/core` provides. `fromModel` needs none.

```ts
import { fromModel, parse, stringify, toModel } from "@ts-graphviz/ast";
import { defaultModelsContext } from "@ts-graphviz/core";

const ast = parse("digraph G { A -> B; }");

// The model of a `Dot` AST node is a `DotModel`: the graphs and comments of one source.
const dot = toModel(ast, { models: defaultModelsContext() });
const graph = dot.graphs[0];
graph.createNode("C");

console.log(stringify(fromModel(graph)));
// digraph "G" {
//   "A" -> "B";
//   "C";
// }
```

### Checking Untrusted DOT

`sanitize` parses a DOT string, rejects what would make Graphviz read files, write unsafe links or write text unescaped, and returns DOT printed from the checked AST. `@ts-graphviz/adapter` runs it by default before rendering.

```ts
import { sanitize } from "@ts-graphviz/ast";

const checked = sanitize('digraph { a [label="hello"]; }', { format: "svg" });
console.log(checked);
// digraph {
//   a [
//     label = "hello";
//   ];
// }

try {
  sanitize('digraph { a [image="/etc/passwd"]; }');
} catch (e) {
  console.log((e as DOMException).name);
  // SecurityError
}
```

It takes the parser limits above, the output `format` to check for, and `policy: 'strict'`, which allows only the attributes and HTML-like tags Graphviz defines. The [security model](https://ts-graphviz.github.io/docs/ts-graphviz/advanced-topics/security-model/) lists what is checked.

## Error Handling

When a DOT source does not parse, or exceeds a parser limit, the parser throws a `DotSyntaxError`, which is a `SyntaxError`.

- `code` is `'TSG_ERR_DOT_SYNTAX'`. Every error the package raises on purpose has a `code` that starts with `TSG_ERR_`; `isTsGraphvizError` from `@ts-graphviz/common` tells such an error from any other.
- `location` is where in the source the error is (`start` and `end`, each with `offset`, `line` and `column`), when it is at a place.
- `limit` is the name of the parser option whose limit the source exceeded (`'maxInputSize'`, `'maxASTNodes'`, …), or `undefined` for a syntax error.

```ts
import { DotSyntaxError, parse } from "@ts-graphviz/ast";

try {
  parse("digraph { a -> }");
} catch (e) {
  if (e instanceof DotSyntaxError) {
    console.log(e.code, e.location?.start.line, e.location?.start.column);
    // TSG_ERR_DOT_SYNTAX 1 16
  }
}
```

Match on `code`, `location` and `limit`; the message text may change in any release.

## Contributors 👥

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://blog.kamiazya.tech/"><img src="https://avatars0.githubusercontent.com/u/35218186?v=4?s=100" width="100px;" alt="Yuki Yamazaki"/><br /><sub><b>Yuki Yamazaki</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/commits?author=kamiazya" title="Code">💻</a> <a href="https://github.com/ts-graphviz/ts-graphviz/commits?author=kamiazya" title="Tests">⚠️</a> <a href="https://github.com/ts-graphviz/ts-graphviz/commits?author=kamiazya" title="Documentation">📖</a> <a href="#ideas-kamiazya" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://laysent.com"><img src="https://avatars2.githubusercontent.com/u/1191606?v=4?s=100" width="100px;" alt="LaySent"/><br /><sub><b>LaySent</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/issues?q=author%3Alaysent" title="Bug reports">🐛</a> <a href="https://github.com/ts-graphviz/ts-graphviz/commits?author=laysent" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/elasticdotventures"><img src="https://avatars0.githubusercontent.com/u/35611074?v=4?s=100" width="100px;" alt="elasticdotventures"/><br /><sub><b>elasticdotventures</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/commits?author=elasticdotventures" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ChristianMurphy"><img src="https://avatars.githubusercontent.com/u/3107513?v=4?s=100" width="100px;" alt="Christian Murphy"/><br /><sub><b>Christian Murphy</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/commits?author=ChristianMurphy" title="Code">💻</a> <a href="#ideas-ChristianMurphy" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/ts-graphviz/ts-graphviz/commits?author=ChristianMurphy" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ArtemAdamenko"><img src="https://avatars.githubusercontent.com/u/2178516?v=4?s=100" width="100px;" alt="Artem"/><br /><sub><b>Artem</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/issues?q=author%3AArtemAdamenko" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fredericohpandolfo"><img src="https://avatars.githubusercontent.com/u/24229136?v=4?s=100" width="100px;" alt="fredericohpandolfo"/><br /><sub><b>fredericohpandolfo</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/issues?q=author%3Afredericohpandolfo" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/diegoquinteiro"><img src="https://avatars.githubusercontent.com/u/1878108?v=4?s=100" width="100px;" alt="diegoquinteiro"/><br /><sub><b>diegoquinteiro</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/issues?q=author%3Adiegoquinteiro" title="Bug reports">🐛</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/robross0606"><img src="https://avatars.githubusercontent.com/u/2965467?v=4?s=100" width="100px;" alt="robross0606"/><br /><sub><b>robross0606</b></sub></a><br /><a href="#ideas-robross0606" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://blake-regalia.net"><img src="https://avatars.githubusercontent.com/u/1456400?v=4?s=100" width="100px;" alt="Blake Regalia"/><br /><sub><b>Blake Regalia</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/issues?q=author%3Ablake-regalia" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/bigbug"><img src="https://avatars.githubusercontent.com/u/27259?v=4?s=100" width="100px;" alt="bigbug"/><br /><sub><b>bigbug</b></sub></a><br /><a href="#question-bigbug" title="Answering Questions">💬</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/murawakimitsuhiro"><img src="https://avatars.githubusercontent.com/u/13833242?v=4?s=100" width="100px;" alt="mrwk"/><br /><sub><b>mrwk</b></sub></a><br /><a href="#question-murawakimitsuhiro" title="Answering Questions">💬</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/svdvonde"><img src="https://avatars.githubusercontent.com/u/2751783?v=4?s=100" width="100px;" alt="svdvonde"/><br /><sub><b>svdvonde</b></sub></a><br /><a href="#question-svdvonde" title="Answering Questions">💬</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/seethroughdev"><img src="https://avatars.githubusercontent.com/u/203779?v=4?s=100" width="100px;" alt="Adam"/><br /><sub><b>Adam</b></sub></a><br /><a href="#question-seethroughdev" title="Answering Questions">💬</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/trevor-scheer"><img src="https://avatars.githubusercontent.com/u/29644393?v=4?s=100" width="100px;" alt="Trevor Scheer"/><br /><sub><b>Trevor Scheer</b></sub></a><br /><a href="#a11y-trevor-scheer" title="Accessibility">️️️️♿️</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://pre.ms"><img src="https://avatars.githubusercontent.com/u/238277?v=4?s=100" width="100px;" alt="Prem Pillai"/><br /><sub><b>Prem Pillai</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/issues?q=author%3Acloud-on-prem" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/nagasawaryoya"><img src="https://avatars.githubusercontent.com/u/53528726?v=4?s=100" width="100px;" alt="nagasawaryoya"/><br /><sub><b>nagasawaryoya</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/commits?author=nagasawaryoya" title="Code">💻</a> <a href="https://github.com/ts-graphviz/ts-graphviz/commits?author=nagasawaryoya" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/tokidrill"><img src="https://avatars.githubusercontent.com/u/42460318?v=4?s=100" width="100px;" alt="YukiSasaki"/><br /><sub><b>YukiSasaki</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/commits?author=tokidrill" title="Code">💻</a> <a href="https://github.com/ts-graphviz/ts-graphviz/commits?author=tokidrill" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Madd0g"><img src="https://avatars.githubusercontent.com/u/1171003?v=4?s=100" width="100px;" alt="Madd0g"/><br /><sub><b>Madd0g</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/issues?q=author%3AMadd0g" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/j4k0xb"><img src="https://avatars.githubusercontent.com/u/55899582?v=4?s=100" width="100px;" alt="j4k0xb"/><br /><sub><b>j4k0xb</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/issues?q=author%3Aj4k0xb" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/haved"><img src="https://avatars.githubusercontent.com/u/3748845?v=4?s=100" width="100px;" alt="HKrogstie"/><br /><sub><b>HKrogstie</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/issues?q=author%3Ahaved" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/septatrix"><img src="https://avatars.githubusercontent.com/u/24257556?v=4?s=100" width="100px;" alt="Nils K"/><br /><sub><b>Nils K</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/issues?q=author%3Aseptatrix" title="Bug reports">🐛</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/hao2013"><img src="https://avatars.githubusercontent.com/u/67059492?v=4?s=100" width="100px;" alt="hao2013"/><br /><sub><b>hao2013</b></sub></a><br /><a href="#maintenance-hao2013" title="Maintenance">🚧</a> <a href="https://github.com/ts-graphviz/ts-graphviz/pulls?q=is%3Apr+reviewed-by%3Ahao2013" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.walterra.dev"><img src="https://avatars.githubusercontent.com/u/230104?v=4?s=100" width="100px;" alt="Walter Rafelsberger"/><br /><sub><b>Walter Rafelsberger</b></sub></a><br /><a href="#question-walterra" title="Answering Questions">💬</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/grsjst"><img src="https://avatars.githubusercontent.com/u/4739018?v=4?s=100" width="100px;" alt="grsjst"/><br /><sub><b>grsjst</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/issues?q=author%3Agrsjst" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/stephenirven"><img src="https://avatars.githubusercontent.com/u/4293560?v=4?s=100" width="100px;" alt="Steve"/><br /><sub><b>Steve</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/issues?q=author%3Astephenirven" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/btomaj"><img src="https://avatars.githubusercontent.com/u/2638986?v=4?s=100" width="100px;" alt="poetry by"/><br /><sub><b>poetry by</b></sub></a><br /><a href="https://github.com/ts-graphviz/ts-graphviz/issues?q=author%3Abtomaj" title="Bug reports">🐛</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors)
specification. Contributions of any kind welcome!

## Changelog 📜

See [CHANGELOG.md](https://github.com/ts-graphviz/ts-graphviz/blob/main/packages/ast/CHANGELOG.md) for more details.

## License ⚖️

This software is released under the MIT License, see [LICENSE](https://github.com/ts-graphviz/ts-graphviz/blob/main/LICENSE).
