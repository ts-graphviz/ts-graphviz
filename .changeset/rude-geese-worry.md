---
"@ts-graphviz/react": major
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

// After - Container moved to options, concurrent rendering by default
const graph = await render(<Digraph>...</Digraph>, { container, ...options });
const dotString = await renderToDot(<Digraph>...</Digraph>, { container, ...options });
```

## ✨ NEW FEATURES

### Unified Concurrent Rendering
- 🆕 `concurrent` option in `RenderOptions` (default: `true`)
- Uses React's `startTransition` for improved performance
- Can be disabled for synchronous behavior when needed
- Enhanced performance for complex graph structures

### Advanced Error Handling
- 🆕 `onUncaughtError` callback with component stack traces
- 🆕 `onCaughtError` callback for error boundary integration
- Better debugging capabilities for rendering failures

```typescript
// Concurrent rendering (default)
const graph = await render(<Digraph>...</Digraph>, {
  timeout: 5000,
  onUncaughtError: (error, errorInfo) => {
    console.error('Rendering error:', error);
    console.log('Component stack:', errorInfo.componentStack);
  }
});

// Disable concurrent rendering if needed
const graph = await render(<Digraph>...</Digraph>, { concurrent: false });
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

2. **Update Function Signatures**
   Container parameter moved to options object:
   ```typescript
   // Old API
   - const graph = await render(<MyGraph />, container);
   - const dot = await renderToDot(<MyGraph />, container);

   // New API
   + const graph = await render(<MyGraph />, { container });
   + const dot = await renderToDot(<MyGraph />, { container });
   ```

3. **Add Error Handling (Optional)**
   ```typescript
   const graph = await render(<MyGraph />, {
     onUncaughtError: (error, errorInfo) => {
       console.error('Graph rendering failed:', error);
     }
   });
   ```

4. **Configure Concurrent Rendering (Optional)**
   ```typescript
   // Concurrent rendering is enabled by default
   const graph = await render(<ComplexGraph />);

   // Disable if synchronous behavior is needed
   const graph = await render(<ComplexGraph />, { concurrent: false });
   ```

### API Reference

**Core Functions:**
- `render(element, options?)` - Primary async rendering with concurrent support
- `renderToDot(element, options?)` - Primary DOT string generation with concurrent support

**Options:**
```typescript
interface RenderOptions<T extends GraphBaseModel = GraphBaseModel> {
  container?: T;              // Container graph (moved from parameter)
  concurrent?: boolean;       // Enable concurrent rendering (default: true)
  timeout?: number;          // Rendering timeout (default: 5000ms)
  onUncaughtError?: (error: Error, errorInfo: { componentStack?: string }) => void;
  onCaughtError?: (error: Error, errorInfo: { componentStack?: string }) => void;
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
