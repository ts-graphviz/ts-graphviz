---
"@ts-graphviz/react": minor
---

## `@ts-graphviz/react` integrate with ts-graphviz monorepo

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
import { Digraph, Node, Edge, render } from '@ts-graphviz/react';

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

import { renderHTMLLike } from '@ts-graphviz/react';

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
