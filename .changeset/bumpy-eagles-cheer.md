---
"ts-graphviz": major
"@ts-graphviz/adapter": major
"@ts-graphviz/common": major
"@ts-graphviz/react": minor
"@ts-graphviz/core": major
"@ts-graphviz/ast": major
---
🚨 Breaking Changes: Drop Node.js 18 support

Minimum required version is now Node.js 20+

### ESM-Only Distribution
- **Remove CommonJS builds**: All packages now distribute only ESM (ECMAScript Modules)
- **Package exports**: Removed `require` fields from `package.json` exports
- **Module type**: All packages are now `"type": "module"`

## 🔄 Migration Guide

### For ESM Projects (Recommended)
```json
{
  "type": "module"
}
```

```typescript
// Import syntax remains unchanged
import { Digraph, Node, Edge, toDot } from 'ts-graphviz';
import { toFile } from 'ts-graphviz/adapter';
import { parse } from 'ts-graphviz/ast';
```

### For CommonJS Projects

If you are using CommonJS (CJS) and need to migrate to ESM, you will need to update your project to support dynamic imports. This is necessary because the packages no longer provide CommonJS builds.

### Before (CJS)

```javascript
// JavaScript (CommonJS)
function createGraph() {
  // Dynamic import is required because the packages no longer provide CommonJS builds.
  const { Digraph, Node, Edge, toDot } = require('ts-graphviz');
  const graph = new Digraph();
  return toDot(graph);
}
```

### After (ESM)

```javascript
async function createGraph() {
  const { Digraph, Node, Edge, toDot } = await import('ts-graphviz');

  const graph = new Digraph();
  // Create your graph...
  return toDot(graph);
}
```

```typescript
// TypeScript (CommonJS)
// Update tsconfig.json
{
  "compilerOptions": {
    "module": "Node16",
    "moduleResolution": "Node16"
  }
}

// Use dynamic imports
async function createGraph() {
  const tsGraphviz = await import('ts-graphviz');
  const { Digraph, Node, Edge, toDot } = tsGraphviz;

  const graph = new Digraph();
  // Create your graph...
  return toDot(graph);
}
```

## 🎯 Benefits

- **Modern JavaScript**: Leveraging native ES modules for better performance
- **Smaller bundle sizes**: ESM enables better tree-shaking
- **Future-proof**: Aligning with the JavaScript ecosystem direction
- **Better TypeScript support**: Enhanced module resolution
