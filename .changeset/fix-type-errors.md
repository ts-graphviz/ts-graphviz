---
"@ts-graphviz/adapter": patch
"@ts-graphviz/react": patch
---

Fix TypeScript type errors for stricter type checking

- Fix Error constructor usage in @ts-graphviz/adapter for TypeScript 5.9
- Fix optional chaining type assertions in e2e tests
- Fix HTML-like label attribute types in React tests
- Add proper type guards for undefined checks
