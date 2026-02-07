---
"@ts-graphviz/react": minor
---

Auto-augment JSX type definitions for dot:* elements

TypeScript type definitions for HTML-like JSX elements (dot:table, dot:tr, dot:td, dot:br, etc.) are now automatically available when importing `@ts-graphviz/react`. No additional setup such as creating a `jsx.d.ts` file or importing `@ts-graphviz/react/jsx` is required.

This follows the auto-augmentation pattern (similar to react-three-fiber) where importing the package automatically extends React's JSX namespace with the `dot:*` intrinsic elements.

BREAKING CHANGE: The `@ts-graphviz/react/jsx` export has been removed. Users who previously imported from `@ts-graphviz/react/jsx` should remove those imports — the types are now available automatically.
