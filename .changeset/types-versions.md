---
"ts-graphviz": patch
---

Resolve `ts-graphviz/ast` and `ts-graphviz/adapter` types under `moduleResolution: node10`

The published `package.json` now carries `typesVersions` for the two subpath entries, so TypeScript projects that still use the legacy `node` (node10) resolution, which ignores `exports`, find their declarations.
