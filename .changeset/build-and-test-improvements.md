---
"ts-graphviz": patch
"@ts-graphviz/adapter": patch
"@ts-graphviz/ast": patch
"@ts-graphviz/common": patch
"@ts-graphviz/core": patch
"@ts-graphviz/react": patch
---

Improve build and test configurations

- Add engines field requiring Node.js >=20 and pnpm >=10
- Improve npm scripts (test, typecheck:fast, audit commands)
- Update Vitest configuration with coverage thresholds and thread pool
- Update Biome configuration with auto line endings
- Update lefthook with stage_fixed feature
- Update typedoc configuration with better validation
- Make snapshot tests Linux-only to avoid platform differences
