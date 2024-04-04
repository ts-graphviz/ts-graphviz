# @ts-graphviz/react

## 0.10.1

### Patch Changes

- [#1004](https://github.com/ts-graphviz/ts-graphviz/pull/1004) [`fabb8c8`](https://github.com/ts-graphviz/ts-graphviz/commit/fabb8c8b9f3ded57d41d7d4f1d669084ab4e91c9) Thanks [@kamiazya](https://github.com/kamiazya)! - Fix documentation build failed

- Updated dependencies [[`24f4174`](https://github.com/ts-graphviz/ts-graphviz/commit/24f4174a76eaef50fc7d30ae3401c1b23b00789b), [`fabb8c8`](https://github.com/ts-graphviz/ts-graphviz/commit/fabb8c8b9f3ded57d41d7d4f1d669084ab4e91c9)]:
  - ts-graphviz@2.1.1
  - @ts-graphviz/common@2.1.1

## 0.10.0

### Minor Changes

- [#992](https://github.com/ts-graphviz/ts-graphviz/pull/992) [`391e98e`](https://github.com/ts-graphviz/ts-graphviz/commit/391e98edf70bb43c1feb4a00f832fa9d96dd9d39) Thanks [@kamiazya](https://github.com/kamiazya)! - ## `@ts-graphviz/react` integrate with ts-graphviz monorepo

  ### Overview

  - Imported source code from `@ts-graphviz/react` repository and integrated it into the monorepo.
  - Emphasized code quality through component tests and updated function signatures.
    - Renamed functions and types for readability and consistency throughout the ts-graphviz project.

  ### Dependencies

  - Support React 18 and remove `prop-types` as a dependency.
    - `prop-types` is removed because TypeScript can cover the same functionality.
  - Moved `react-dom` to `peerDependencies` for streamlined dependency management.
    - Improved file naming conventions for better codebase organization.

  ### New Features

  #### New HTMLLike label syntax

  ```tsx
  import { Digraph, Node, Edge, render } from "@ts-graphviz/react";

  const dot = render(
    <Digraph>
      <Node
        id="A"
        label={
          <dot:table>
            <dot:tr>
              <dot:td>left</dot:td>
              <dot:td>right</dot:td>
            </dot:tr>
          </dot:table>
        }
      />
    </Digraph>
  );
  ```

  #### `renderHTMLLike` function

  The `renderHTMLLike` function is introduced for rendering HTML-like labels.

  ```tsx
  import { renderHTMLLike } from "@ts-graphviz/react";

  const htmlLike = renderHTMLLike(
    <dot:table>
      <dot:tr>
        <dot:td>left</dot:td>
        <dot:td>right</dot:td>
      </dot:tr>
    </dot:table>
  );
  ```

  ### Other Changes

  - Added the `provenance` flag in `package.json` for enhanced publishing traceability.
  - Enhanced TypeScript support and type definitions, including moving types to `@ts-graphviz/common`.

    - Move HTMLLike type to `@ts-graphviz/common`.

  - Refactor JSX syntax for better compatibility and custom JSX-like syntax for HTMLLike.

### Patch Changes

- Updated dependencies [[`cb5517a`](https://github.com/ts-graphviz/ts-graphviz/commit/cb5517a0236ce33527d200df9770390f4eb40064), [`0589b4f`](https://github.com/ts-graphviz/ts-graphviz/commit/0589b4f8849290d2c4a39beceb9b633f059f2e3f), [`5ce6b59`](https://github.com/ts-graphviz/ts-graphviz/commit/5ce6b59fa395bc344de2bfb15061b158a9ea5586), [`122336b`](https://github.com/ts-graphviz/ts-graphviz/commit/122336bede1033f73a2a94c82d499fda238f6b2e), [`b5f36fa`](https://github.com/ts-graphviz/ts-graphviz/commit/b5f36faf9cf70dfc263130c4480dc21770475c5a), [`c55f2d0`](https://github.com/ts-graphviz/ts-graphviz/commit/c55f2d0dfa851d318cc16a36499c69c0a34f1588), [`81a50ff`](https://github.com/ts-graphviz/ts-graphviz/commit/81a50ff94b461f44256f2eea5b86af5eb26afd94), [`a16f047`](https://github.com/ts-graphviz/ts-graphviz/commit/a16f047dfdd5db73f3e25847cf3fb2f8075aaf11), [`391e98e`](https://github.com/ts-graphviz/ts-graphviz/commit/391e98edf70bb43c1feb4a00f832fa9d96dd9d39), [`a16f047`](https://github.com/ts-graphviz/ts-graphviz/commit/a16f047dfdd5db73f3e25847cf3fb2f8075aaf11), [`a16f047`](https://github.com/ts-graphviz/ts-graphviz/commit/a16f047dfdd5db73f3e25847cf3fb2f8075aaf11)]:
  - ts-graphviz@2.1.0
  - @ts-graphviz/common@2.1.0
