---
"@ts-graphviz/react": minor
---

Add JSX type definitions export for dot:* elements

Add new `@ts-graphviz/react/jsx` export that provides TypeScript type definitions for HTML-like JSX elements (dot:table, dot:tr, dot:td, dot:br, etc.). This follows React 19's module augmentation pattern and allows proper type checking for custom JSX elements used with renderHTMLLike.

The type definitions are automatically available when using @ts-graphviz/react in a monorepo setup via global.d.ts, and can be explicitly imported when needed in standalone projects.
