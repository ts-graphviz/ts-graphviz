---
"@ts-graphviz/react": minor
---

## React 19 Support with Breaking Changes

## 🚨 BREAKING CHANGES

### React 18 Support Discontinued
- **React 19+ is now required** - React 18 and earlier versions are no longer supported
- Updated `peerDependencies` to require `react@>=19` (removed `react-dom` dependency)

### API Changes

**Migration Required:**
```typescript
// Before
const graph = render(<Digraph>...</Digraph>, container);
const dotString = renderToDot(<Digraph>...</Digraph>, container);

// After - New createRoot API following React 19 patterns
const root = createRoot(container);
await root.render(<Digraph>...</Digraph>);
const models = root.getTopLevelModels();
const dotString = await renderToDot(<Digraph>...</Digraph>, { container });
```

### Container Model Access Changes

**🚨 BREAKING CHANGE:** New createRoot API changes how you access rendered models

**Migration Required:**
```typescript
// Before - result.model was the first rendered model
const container = new DigraphModel('parent');
const result = await render(<Node id="test" />, { container });
expect(result.model.$$type).toBe('Node'); // ❌ Old API

// After - Use root.getTopLevelModels() to access models
const container = new DigraphModel('parent');
const root = createRoot(container);
await root.render(<Node id="test" />);
const models = root.getTopLevelModels();
expect(models[0].$$type).toBe('Node'); // ✅ New API
expect(models[0].id).toBe('test');
// Access container directly: container.nodes.length === 1
```

## ✨ NEW FEATURES

### Modern createRoot API
- 🆕 `createRoot()` function following React 19's modern patterns
- Better performance and memory management
- Cleaner API separation between rendering and model access
- Enhanced error handling with root-level configuration

### Advanced Error Handling
- 🆕 `onUncaughtError` callback with component stack traces
- 🆕 `onCaughtError` callback for error boundary integration
- Better debugging capabilities for rendering failures

```typescript
// Create root with error handling
const root = createRoot(undefined, {
  onUncaughtError: (error, errorInfo) => {
    console.error('Rendering error:', error);
    console.log('Component stack:', errorInfo.componentStack);
  }
});

await root.render(<Digraph>...</Digraph>);
const models = root.getTopLevelModels();
```

### Ref as Prop Support
- All components now support React 19's ref as prop pattern
- Direct access to graph models (`NodeModel`, `EdgeModel`, `RootGraphModel`) via refs
- Enhanced TypeScript support with proper model typing

### Reduced Dependencies
- 🆕 Removed `react-dom` dependency - now uses custom HTML rendering implementation
- Smaller bundle size and fewer peer dependencies required
- No longer dependent on React's server-side rendering APIs

## 🔧 TECHNICAL UPDATES

### React Reconciler Modernization
- Updated reconciler to use React 19's new `createContainer` API (8 arguments vs 10)
- Improved memory management and performance
- Better integration with React's concurrent features

### TypeScript Improvements
- Updated JSX namespace declaration from global to module scope
- Fixed React 19 type compatibility issues
- Enhanced type safety for error handlers

### Type System Modernization
- 🆕 **Eliminated manual type assertions** with function overloads and type guards
- 🆕 **Runtime type filtering** using built-in type guards from `@ts-graphviz/common`
- 🆕 **Direct type casting** for performance when user knows exact types
- 🆕 **Type-safe model access** with automatic type narrowing
- 🆕 **Enhanced TypeScript developer experience** with precise type inference
- 🆕 **Flexible type handling** - choose between runtime validation or trusted assertions
- Enhanced debugging capabilities with strongly-typed error handling

**Two approaches for type-safe model access:**

1. **Runtime Type Filtering** (safe, validated):
   ```typescript
   const nodes = root.getTopLevelModels(isNodeModel); // Filters only NodeModel objects
   ```
   - Uses type guard functions for runtime validation
   - Guarantees type safety at runtime
   - Filters out non-matching models

2. **Direct Type Casting** (fast, trusted):
   ```typescript
   const nodes = root.getTopLevelModels<NodeModel>(); // Casts all models as NodeModel
   ```
   - No runtime validation - trusts user assertion
   - Higher performance for known scenarios
   - User responsible for type correctness

### Model Collection Algorithm Improvements
- 🆕 **Container-aware collection** replaces priority-based system
- Fixed unpredictable behavior in nested component structures
- Consistent model return behavior regardless of component hierarchy depth
- Better handling of complex Subgraph and Edge combinations

### Test Infrastructure
- 100% test coverage maintained
- React 19 compatibility validated

## 📚 MIGRATION GUIDE

### Prerequisites
- **Upgrade to React 19+**: Install `react@^19.0.0` (required)
- **Note**: `react-dom` is no longer required as this package now uses a custom HTML rendering implementation

### Step-by-Step Migration

1. **Update React Dependency**
   ```bash
   npm install react@^19.0.0
   # or
   pnpm add react@^19.0.0
   # or
   yarn add react@^19.0.0
   ```

   **Note**: You can now remove `react-dom` from your dependencies if it was only needed for @ts-graphviz/react:
   ```bash
   npm uninstall react-dom
   # or
   pnpm remove react-dom
   # or
   yarn remove react-dom
   ```

2. **Update to createRoot API**
   Replace render function calls with createRoot pattern:
   ```typescript
   // Old API
   - const result = await render(<MyGraph />, container);
   - const dot = await renderToDot(<MyGraph />, container);

   // New API
   + const root = createRoot(container);
   + await root.render(<MyGraph />);
   + const models = root.getTopLevelModels();
   + const dot = await renderToDot(<MyGraph />, { container });
   ```

3. **Update Model Access Patterns**
   ```typescript
   // Old behavior - result.model was the first rendered model
   - const result = await render(<Node id="test" />, { container });
   - expect(result.model.$$type).toBe('Node');

   // New behavior - use root.getTopLevelModels()
   + const root = createRoot(container);
   + await root.render(<Node id="test" />);
   + const models = root.getTopLevelModels();
   + expect(models[0].$$type).toBe('Node');
   + expect(models[0].id).toBe('test');
   ```

4. **Add Error Handling (Optional)**
   ```typescript
   const root = createRoot(undefined, {
     onUncaughtError: (error, errorInfo) => {
       console.error('Graph rendering failed:', error);
     }
   });
   await root.render(<MyGraph />);
   ```

5. **Multiple Renders with Same Root**
   ```typescript
   // Create root once, use multiple times
   const root = createRoot();
   await root.render(<GraphA />);
   await root.render(<GraphB />); // Replaces previous render
   ```

### API Reference

**Core Functions:**
- `createRoot(container?, options?)` - Creates a rendering root following React 19 patterns
- `renderToDot(element, options?)` - Primary DOT string generation

**createRoot Options:**
```typescript
interface CreateRootOptions {
  onUncaughtError?: (error: Error, errorInfo: ErrorInfo) => void;
  onCaughtError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRecoverableError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRenderComplete?: (models: DotObjectModel[]) => void;
  timeout?: number;           // Rendering timeout (default: 5000ms)
  concurrent?: boolean;       // Enable concurrent rendering (default: true)
}

interface GraphvizRoot {
  render(element: ReactElement): Promise<void>;
  unmount(): void;
  // Overloaded for type-safe filtering and direct type casting
  getTopLevelModels(): DotObjectModel[];
  getTopLevelModels<T extends DotObjectModel>(
    typeGuard: (model: DotObjectModel) => model is T
  ): T[];  // Runtime type filtering with validation
  getTopLevelModels<T extends DotObjectModel>(): T[];  // Direct type casting (trusted assertion)
}
```

**Type-Safe Model Access Examples:**
```typescript
// Import type guards for runtime type filtering
import { isNodeModel, isEdgeModel, isRootGraphModel } from '@ts-graphviz/common';

const root = createRoot();
await root.render(<MyGraph />);

// === APPROACH 1: Runtime Type Filtering (Safe) ===
// Uses type guard functions - validates types at runtime
const validatedNodes = root.getTopLevelModels(isNodeModel);     // Only actual NodeModel objects
const validatedEdges = root.getTopLevelModels(isEdgeModel);     // Only actual EdgeModel objects
const validatedGraphs = root.getTopLevelModels(isRootGraphModel); // Only actual RootGraphModel objects

// Guaranteed type safety - filters out non-matching models
console.log(`Found ${validatedNodes.length} nodes`);  // Could be 0 if no nodes exist
validatedNodes.forEach(node => console.log(node.id)); // All items are definitely NodeModel

// === APPROACH 2: Direct Type Casting (Fast) ===
// User assertion - no runtime validation, trusts the user
const allAsNodes = root.getTopLevelModels<NodeModel>();   // ALL models cast as NodeModel[]
const allAsEdges = root.getTopLevelModels<EdgeModel>();   // ALL models cast as EdgeModel[]

// Higher performance but requires user knowledge
console.log(`Treating ${allAsNodes.length} models as nodes`); // Returns all models
// Warning: If models aren't actually NodeModel, runtime errors may occur

// === MIXED USAGE PATTERNS ===
// Get all models first, then decide approach
const allModels = root.getTopLevelModels();
if (allModels.every(isNodeModel)) {
  // Safe to use direct casting since we validated
  const nodes = root.getTopLevelModels<NodeModel>();
  nodes.forEach(node => console.log(`Node: ${node.id}`));
} else {
  // Use filtering for mixed model types
  const nodes = root.getTopLevelModels(isNodeModel);
  const edges = root.getTopLevelModels(isEdgeModel);
  console.log(`Found ${nodes.length} nodes and ${edges.length} edges`);
}
```

**renderToDot Options:**
```typescript
interface RenderToDotOptions<T extends AnyGraphContainer = AnyGraphContainer> {
  container?: T;              // Container graph for nested rendering
  onUncaughtError?: (error: Error, errorInfo: ErrorInfo) => void;
  onCaughtError?: (error: Error, errorInfo: ErrorInfo) => void;
  timeout?: number;           // Rendering timeout in milliseconds
  concurrent?: boolean;       // Enable concurrent rendering
}
```

## 📦 INSTALLATION

```bash
# Install React 19 (required)
npm install react@^19

# Update to latest @ts-graphviz/react
npm install @ts-graphviz/react@latest

# Note: react-dom is no longer required
```

This release represents a strategic modernization to ensure long-term compatibility with React's ecosystem while providing improved performance and developer experience.
