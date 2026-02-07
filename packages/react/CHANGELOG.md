# @ts-graphviz/react

## 0.12.0

### Minor Changes

- [#1567](https://github.com/ts-graphviz/ts-graphviz/pull/1567) [`8edec59`](https://github.com/ts-graphviz/ts-graphviz/commit/8edec5962ac368d759a4903f69e8db2cd0496c97) Thanks [@kamiazya](https://github.com/kamiazya)! - Auto-augment JSX type definitions for dot:\* elements

  TypeScript type definitions for HTML-like JSX elements (dot:table, dot:tr, dot:td, dot:br, etc.) are now automatically available when importing `@ts-graphviz/react`. No additional setup such as creating a `jsx.d.ts` file or importing `@ts-graphviz/react/jsx` is required.

  This follows the auto-augmentation pattern (similar to react-three-fiber) where importing the package automatically extends React's JSX namespace with the `dot:*` intrinsic elements.

  BREAKING CHANGE: The `@ts-graphviz/react/jsx` export has been removed. Users who previously imported from `@ts-graphviz/react/jsx` should remove those imports — the types are now available automatically.

### Patch Changes

- [#1539](https://github.com/ts-graphviz/ts-graphviz/pull/1539) [`6d9cfc8`](https://github.com/ts-graphviz/ts-graphviz/commit/6d9cfc8b78a4fab6d8bffff79802c144084e75c8) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump vite from 7.0.8 to 7.1.12

- Updated dependencies [[`6d9cfc8`](https://github.com/ts-graphviz/ts-graphviz/commit/6d9cfc8b78a4fab6d8bffff79802c144084e75c8), [`0bbfc4b`](https://github.com/ts-graphviz/ts-graphviz/commit/0bbfc4b9b75a148a7befa38de56e708c6b50e534)]:
  - @ts-graphviz/common@3.0.5
  - ts-graphviz@3.0.7

## 0.11.6

### Patch Changes

- [#1532](https://github.com/ts-graphviz/ts-graphviz/pull/1532) [`dc3ef34`](https://github.com/ts-graphviz/ts-graphviz/commit/dc3ef34316f5642c416711cb6a50704dbef7bb64) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump vite from 7.0.2 to 7.0.8 in the npm_and_yarn group across 1 directory

- Updated dependencies [[`4296b4e`](https://github.com/ts-graphviz/ts-graphviz/commit/4296b4e0cf17f36cc385c2ce93ec7ec89bd4a73a), [`dc3ef34`](https://github.com/ts-graphviz/ts-graphviz/commit/dc3ef34316f5642c416711cb6a50704dbef7bb64)]:
  - ts-graphviz@3.0.6
  - @ts-graphviz/common@3.0.4

## 0.11.5

### Patch Changes

- [#1529](https://github.com/ts-graphviz/ts-graphviz/pull/1529) [`2175a0b`](https://github.com/ts-graphviz/ts-graphviz/commit/2175a0b15ee57f675a1fda902b74d8359a5c05cb) Thanks [@kamiazya](https://github.com/kamiazya)! - Security enhancement: Add stack overflow protection to `renderHTMLLike` function

  This patch addresses a security vulnerability where deeply nested or circular React element structures could cause stack overflow, leading to application crashes and potential DoS attacks.

  **Changes:**

  - Added maximum recursion depth limit (default: 1000 levels) to prevent stack overflow attacks
  - Implemented circular reference detection to prevent infinite loops
  - Introduced `RenderHTMLLikeOptions` interface with configurable `maxDepth` option
  - Enhanced error handling with descriptive error messages and console warnings

  **Security Impact:**

  - Prevents stack overflow from deeply nested React element structures
  - Prevents infinite loops from circular element references
  - Normal use cases are unaffected by the default 1000-level depth limit
  - Configurable limit allows complex rendering when needed

  **Usage:**

  ```ts
  // Default behavior (max depth: 1000)
  renderHTMLLike(
    <div>
      <span>Hello</span>
    </div>
  );

  // Custom max depth for complex structures
  renderHTMLLike(<div>...</div>, { maxDepth: 5000 });

  // Stricter validation for user-generated content
  renderHTMLLike(userElement, { maxDepth: 100 });
  ```

- [#1530](https://github.com/ts-graphviz/ts-graphviz/pull/1530) [`52e3f1f`](https://github.com/ts-graphviz/ts-graphviz/commit/52e3f1ff58a77bf9bd9a0d0b6e29edb20e3700e5) Thanks [@kamiazya](https://github.com/kamiazya)! - Clarify security model: GraphViz HTML-like labels vs browser HTML

  Add documentation clarifying that HTML-like labels are part of the GraphViz DOT language specification and are not browser HTML. This helps prevent confusion about XSS risks, which occur when rendering GraphViz output in browsers, not when generating DOT strings.

- Updated dependencies []:
  - ts-graphviz@3.0.5

## 0.11.4

### Patch Changes

- [#1513](https://github.com/ts-graphviz/ts-graphviz/pull/1513) [`9d52d28`](https://github.com/ts-graphviz/ts-graphviz/commit/9d52d282031ed173a75ef0fb77ddea9677f78520) Thanks [@kamiazya](https://github.com/kamiazya)! - Fix @next tag publishing pipeline to prevent incorrect releases

  This fix addresses issues with the @next tag publishing workflow where stable versions were incorrectly published with @next tag, and subsequently, @next versions stopped being published entirely.

  **Problem 1 (PR #1513):**
  Stable package versions were being incorrectly published with the @next tag instead of the latest tag. The Changesets action switches to `changeset-release/main` and updates package.json versions, but the @next publish step would run on this branch where no unreleased changesets remain, causing stable versions to be published with @next tag.

  **Solution 1:**
  Added a branch check step to verify the current working directory is on the main branch before executing @next publish.

  **Problem 2 (This PR):**
  The branch check from PR #1513 prevented ALL @next publishes because the changesets action never switches back to main, causing the branch check to always fail.

  **Solution 2:**
  Added a step to switch back to the main branch after the changesets action completes. This ensures the working directory is in the correct state for snapshot versioning while maintaining the safety check.

  **Changes:**

  - Added branch check to verify current branch before @next publish
  - Added `git checkout main` step after changesets action
  - Updated @next publish condition to include branch verification
  - Removed redundant commit message check that was ineffective

- [#1514](https://github.com/ts-graphviz/ts-graphviz/pull/1514) [`d74172a`](https://github.com/ts-graphviz/ts-graphviz/commit/d74172a594531f071b7e06c079b6555d867bf683) Thanks [@kamiazya](https://github.com/kamiazya)! - Migrate npm publishing to OIDC trusted publishing

  This change migrates the npm publishing workflow from using long-lived NPM_TOKEN secrets to OIDC (OpenID Connect) trusted publishing, following GitHub's security recommendations announced in September 2025.

  **Benefits:**

  - Enhanced security: No more long-lived tokens to manage, rotate, or accidentally expose
  - Automatic provenance: Provenance attestations are generated automatically without the --provenance flag
  - Compliance: Aligns with npm's new authentication requirements (token expiration limits)
  - Short-lived credentials: Each publish uses workflow-specific, ephemeral credentials

  **Changes:**

  - Added `environment: npm` to the release job to match trusted publisher configuration
  - Upgraded npm CLI to latest version (≥11.5.1) for OIDC support
  - Removed NPM_TOKEN from changesets action and snapshot publish steps
  - Removed manual .npmrc creation as authentication now uses OIDC tokens
  - Updated id-token permission comment to reflect OIDC usage

  **Requirements:**

  - npm CLI v11.5.1 or later (automatically installed in workflow)
  - Trusted publisher configured for each package on npmjs.com
  - GitHub Actions environment named "npm" configured for the repository

- [#1512](https://github.com/ts-graphviz/ts-graphviz/pull/1512) [`de566db`](https://github.com/ts-graphviz/ts-graphviz/commit/de566db993e1f62325f3a4afdbde178b86a96509) Thanks [@anubhav-goel](https://github.com/anubhav-goel)! - Updated broken monorepo package links to valid URLs

- Updated dependencies [[`9d52d28`](https://github.com/ts-graphviz/ts-graphviz/commit/9d52d282031ed173a75ef0fb77ddea9677f78520), [`1b94e27`](https://github.com/ts-graphviz/ts-graphviz/commit/1b94e27674bf33b8e605c54eef6f05c5dd95852a), [`d74172a`](https://github.com/ts-graphviz/ts-graphviz/commit/d74172a594531f071b7e06c079b6555d867bf683), [`de566db`](https://github.com/ts-graphviz/ts-graphviz/commit/de566db993e1f62325f3a4afdbde178b86a96509)]:
  - @ts-graphviz/common@3.0.3
  - ts-graphviz@3.0.4

## 0.11.2

### Patch Changes

- [#1483](https://github.com/ts-graphviz/ts-graphviz/pull/1483) [`a07d3b7`](https://github.com/ts-graphviz/ts-graphviz/commit/a07d3b7037d08bcb99679562468e16e5af0968ba) Thanks [@kamiazya](https://github.com/kamiazya)! - Fix CI workflow to prevent @next tag publishing after Version Packages PR merge

- Updated dependencies [[`a07d3b7`](https://github.com/ts-graphviz/ts-graphviz/commit/a07d3b7037d08bcb99679562468e16e5af0968ba)]:
  - @ts-graphviz/common@3.0.2
  - ts-graphviz@3.0.2

## 0.11.1

### Patch Changes

- [#1480](https://github.com/ts-graphviz/ts-graphviz/pull/1480) [`ab5d0c7`](https://github.com/ts-graphviz/ts-graphviz/commit/ab5d0c75620a0fd1bf36373716b26c2d433a0bc6) Thanks [@kamiazya](https://github.com/kamiazya)! - Fix CI workflow to prevent publishing stable releases with @next tag

- Updated dependencies [[`ab5d0c7`](https://github.com/ts-graphviz/ts-graphviz/commit/ab5d0c75620a0fd1bf36373716b26c2d433a0bc6)]:
  - @ts-graphviz/common@3.0.1
  - ts-graphviz@3.0.1

## 0.11.0

### Minor Changes

- [#1363](https://github.com/ts-graphviz/ts-graphviz/pull/1363) [`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c) Thanks [@kamiazya](https://github.com/kamiazya)! - 🚨 Breaking Changes: Drop Node.js 18 support

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
  import { Digraph, Node, Edge, toDot } from "ts-graphviz";
  import { toFile } from "ts-graphviz/adapter";
  import { parse } from "ts-graphviz/ast";
  ```

  ### For CommonJS Projects

  If you are using CommonJS (CJS) and need to migrate to ESM, you will need to update your project to support dynamic imports. This is necessary because the packages no longer provide CommonJS builds.

  ### Before (CJS)

  ```javascript
  // JavaScript (CommonJS)
  function createGraph() {
    // Dynamic import is required because the packages no longer provide CommonJS builds.
    const { Digraph, Node, Edge, toDot } = require("ts-graphviz");
    const graph = new Digraph();
    return toDot(graph);
  }
  ```

  ### After (ESM)

  ```javascript
  async function createGraph() {
    const { Digraph, Node, Edge, toDot } = await import("ts-graphviz");

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

- [#1363](https://github.com/ts-graphviz/ts-graphviz/pull/1363) [`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c) Thanks [@kamiazya](https://github.com/kamiazya)! - Define Supported environment and Support levels

  To provide clarity on the environments in which ts-graphviz operates, we have categorized support levels:

  ## Support Levels

  ### Tier 1: Full Support

  - **Definition**: Environments that are fully supported, with comprehensive automated testing and maintenance.
  - **Environments**:
    - **Node.js LTS versions**: All active Long-Term Support (LTS) versions.
      - If a Node.js LTS version is released, we will ensure compatibility with it.
      - If a Node.js LTS version is deprecated, we will drop support for it in the next major release.
  - **Details**:
    - We run automated tests on all LTS versions of Node.js.
    - Full compatibility and performance are ensured.
    - Critical issues are prioritized for fixes.

  ### Tier 2: Active Support

  - **Definition**: Environments that receive active support with limited automated testing.
  - **Environments**:
    - **Deno Latest LTS version**: The latest Long-Term Support (LTS) version of Deno.
      - If a new Deno LTS version is released, we will ensure compatibility with it.
      - If a Deno LTS version is deprecated, we will drop support for it in the next minor release.
    - **Node.js Current Release**: The latest Node.js release outside the LTS schedule.
      - If a new Node.js current release is available, we will ensure compatibility with it.
      - If a Node.js current release is deprecated, we will drop support for it in the next minor release.
  - **Details**:
    - Compatibility is maintained, and issues are addressed.

  ### Tier 3: Community Support

  - **Definition**: Environments that are not officially tested but are supported on a best-effort basis.
  - **Environments**:
    - **Modern Browsers**: Latest versions of major browsers, including:
      - Google Chrome
      - Mozilla Firefox
      - Microsoft Edge
      - Apple Safari
    - **Deno Current Release**: The latest Deno release outside the LTS schedule.
  - **Details**:
    - Installation methods are provided.
    - No automated testing is performed.
    - Issues reported by users will be addressed.
    - Targeting the latest versions ensures compatibility with modern web standards.
    - We will not actively test or maintain compatibility with older versions of browsers.

- [#1363](https://github.com/ts-graphviz/ts-graphviz/pull/1363) [`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c) Thanks [@kamiazya](https://github.com/kamiazya)! - ## React 19 Support with Breaking Changes

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
  const root = createRoot({ container });
  await root.render(<Digraph>...</Digraph>);
  const models = root.getTopLevelModels();
  const dotString = await renderToDot(<Digraph>...</Digraph>, { container });
  ```

  ### Container Model Access Changes

  **🚨 BREAKING CHANGE:** New createRoot API changes how you access rendered models

  **Migration Required:**

  ```typescript
  // Before - result.model was the first rendered model
  const container = new DigraphModel("parent");
  const result = await render(<Node id="test" />, { container });
  expect(result.model.$type).toBe("Node"); // ❌ Old API

  // After - Use root.getTopLevelModels() to access models
  const container = new DigraphModel("parent");
  const root = createRoot({ container });
  await root.render(<Node id="test" />);
  const models = root.getTopLevelModels();
  expect(models[0].$type).toBe("Node"); // ✅ New API
  expect(models[0].id).toBe("test");
  // Access container directly: container.nodes.length === 1
  ```

  ## ✨ NEW FEATURES

  ### Modern createRoot API

  - 🆕 `createRoot()` function following React 19's modern patterns
  - 🆕 **Simplified API**: `createRoot(options)` - single options parameter for all configuration
  - 🆕 **Container in options**: `createRoot({ container, onRenderComplete })` for cleaner code
  - Better performance and memory management
  - Cleaner API separation between rendering and model access
  - Enhanced error handling with root-level configuration

  ### Advanced Error Handling

  - 🆕 `onUncaughtError` callback with component stack traces
  - 🆕 `onCaughtError` callback for error boundary integration
  - Better debugging capabilities for rendering failures

  ```typescript
  // Create root with error handling
  const root = createRoot({
    onUncaughtError: (error, errorInfo) => {
      console.error("Rendering error:", error);
      console.log("Component stack:", errorInfo.componentStack);
    },
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
  - Simplified rendering by removing library-level concurrent control (users can wrap with startTransition if needed)

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
     + const root = createRoot({ container });
     + await root.render(<MyGraph />);
     + const models = root.getTopLevelModels();
     + const dot = await renderToDot(<MyGraph />, { container });
     ```

  3. **Update Model Access Patterns**

     ```typescript
     // Old behavior - result.model was the first rendered model
     - const result = await render(<Node id="test" />, { container });
     - expect(result.model.$type).toBe('Node');

     // New behavior - use root.getTopLevelModels()
     + const root = createRoot(container);
     + await root.render(<Node id="test" />);
     + const models = root.getTopLevelModels();
     + expect(models[0].$type).toBe('Node');
     + expect(models[0].id).toBe('test');
     ```

  4. **Add Error Handling (Optional)**

     ```typescript
     const root = createRoot(undefined, {
       onUncaughtError: (error, errorInfo) => {
         console.error("Graph rendering failed:", error);
       },
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
  interface CreateRootOptions<
    Container extends AnyGraphContainer = AnyGraphContainer
  > {
    container?: Container; // Container graph for rendering components
    onUncaughtError?: (error: Error, errorInfo: ErrorInfo) => void;
    onCaughtError?: (error: Error, errorInfo: ErrorInfo) => void;
    onRecoverableError?: (error: Error, errorInfo: ErrorInfo) => void;
    onRenderComplete?: (models: DotObjectModel[]) => void;
    timeout?: number; // Rendering timeout (default: 5000ms)
  }

  interface GraphvizRoot {
    render(element: ReactElement): Promise<void>;
    unmount(): void;
    // Overloaded for type-safe filtering and direct type casting
    getTopLevelModels(): DotObjectModel[];
    getTopLevelModels<T extends DotObjectModel>(
      typeGuard: (model: DotObjectModel) => model is T
    ): T[]; // Runtime type filtering with validation
    getTopLevelModels<T extends DotObjectModel>(): T[]; // Direct type casting (trusted assertion)
  }
  ```

  **Type-Safe Model Access Examples:**

  ```typescript
  // Import type guards for runtime type filtering
  import {
    isNodeModel,
    isEdgeModel,
    isRootGraphModel,
  } from "@ts-graphviz/common";

  const root = createRoot();
  await root.render(<MyGraph />);

  // === APPROACH 1: Runtime Type Filtering (Safe) ===
  // Uses type guard functions - validates types at runtime
  const validatedNodes = root.getTopLevelModels(isNodeModel); // Only actual NodeModel objects
  const validatedEdges = root.getTopLevelModels(isEdgeModel); // Only actual EdgeModel objects
  const validatedGraphs = root.getTopLevelModels(isRootGraphModel); // Only actual RootGraphModel objects

  // Guaranteed type safety - filters out non-matching models
  console.log(`Found ${validatedNodes.length} nodes`); // Could be 0 if no nodes exist
  validatedNodes.forEach((node) => console.log(node.id)); // All items are definitely NodeModel

  // === APPROACH 2: Direct Type Casting (Fast) ===
  // User assertion - no runtime validation, trusts the user
  const allAsNodes = root.getTopLevelModels<NodeModel>(); // ALL models cast as NodeModel[]
  const allAsEdges = root.getTopLevelModels<EdgeModel>(); // ALL models cast as EdgeModel[]

  // Higher performance but requires user knowledge
  console.log(`Treating ${allAsNodes.length} models as nodes`); // Returns all models
  // Warning: If models aren't actually NodeModel, runtime errors may occur

  // === MIXED USAGE PATTERNS ===
  // Get all models first, then decide approach
  const allModels = root.getTopLevelModels();
  if (allModels.every(isNodeModel)) {
    // Safe to use direct casting since we validated
    const nodes = root.getTopLevelModels<NodeModel>();
    nodes.forEach((node) => console.log(`Node: ${node.id}`));
  } else {
    // Use filtering for mixed model types
    const nodes = root.getTopLevelModels(isNodeModel);
    const edges = root.getTopLevelModels(isEdgeModel);
    console.log(`Found ${nodes.length} nodes and ${edges.length} edges`);
  }
  ```

  **renderToDot Options:**

  ```typescript
  interface RenderToDotOptions<
    T extends AnyGraphContainer = AnyGraphContainer
  > {
    container?: T; // Container graph for nested rendering
    onUncaughtError?: (error: Error, errorInfo: ErrorInfo) => void;
    onCaughtError?: (error: Error, errorInfo: ErrorInfo) => void;
    timeout?: number; // Rendering timeout in milliseconds
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

- [#1363](https://github.com/ts-graphviz/ts-graphviz/pull/1363) [`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c) Thanks [@kamiazya](https://github.com/kamiazya)! - Adjust HTML label AST handling for consistent behavior #1335

  Improves the handling of HTML-like labels in the `fromDot` and `toDot` functions to ensure valid Dot output.

### Patch Changes

- [#1363](https://github.com/ts-graphviz/ts-graphviz/pull/1363) [`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c) Thanks [@kamiazya](https://github.com/kamiazya)! - Update Develop Environment

  - Drop turbo
  - Upgrade biome to 2.0
  - Upgrade TypeScript to 5.8
  - Upgrade Vite to 7.0
  - Upgrade Vitest to 3.2
  - Upgrade Peggy to 5.0 and drop ts-pegjs
  - Implement new E2E test workflow

- [#1363](https://github.com/ts-graphviz/ts-graphviz/pull/1363) [`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c) Thanks [@kamiazya](https://github.com/kamiazya)! - New GitHub Action main workflow and tests

- Updated dependencies [[`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c), [`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c), [`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c), [`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c), [`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c)]:
  - ts-graphviz@3.0.0
  - @ts-graphviz/common@3.0.0

## 0.10.6

### Patch Changes

- Updated dependencies []:
  - ts-graphviz@2.1.6

## 0.10.5

### Patch Changes

- Updated dependencies [[`d7ff421`](https://github.com/ts-graphviz/ts-graphviz/commit/d7ff421ec861ca8fdede1a6bdf256f3455fb9797)]:
  - @ts-graphviz/common@2.1.5
  - ts-graphviz@2.1.5

## 0.10.4

### Patch Changes

- [#1179](https://github.com/ts-graphviz/ts-graphviz/pull/1179) [`f48ae4a`](https://github.com/ts-graphviz/ts-graphviz/commit/f48ae4a36fde430cf4a4769189243acd76560946) Thanks [@kamiazya](https://github.com/kamiazya)! - Rollup type declarations

- [#1179](https://github.com/ts-graphviz/ts-graphviz/pull/1179) [`f48ae4a`](https://github.com/ts-graphviz/ts-graphviz/commit/f48ae4a36fde430cf4a4769189243acd76560946) Thanks [@kamiazya](https://github.com/kamiazya)! - build(deps-dev): bump vite-plugin-dts from 3.9.1 to 4.2.1

- [#1213](https://github.com/ts-graphviz/ts-graphviz/pull/1213) [`b44aa66`](https://github.com/ts-graphviz/ts-graphviz/commit/b44aa66d46a0a5240384e70b986ce3e7d0a02218) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump vitest and @vitest/coverage-istanbul

- [#1214](https://github.com/ts-graphviz/ts-graphviz/pull/1214) [`b3a3323`](https://github.com/ts-graphviz/ts-graphviz/commit/b3a3323c70e72c87b7728684a5862b5d6e54fbb9) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump vite from 5.2.8 to 5.4.8

- Updated dependencies [[`9608151`](https://github.com/ts-graphviz/ts-graphviz/commit/9608151b1325484dbd01d5c902e91555219cc3cb), [`f48ae4a`](https://github.com/ts-graphviz/ts-graphviz/commit/f48ae4a36fde430cf4a4769189243acd76560946), [`b44aa66`](https://github.com/ts-graphviz/ts-graphviz/commit/b44aa66d46a0a5240384e70b986ce3e7d0a02218), [`b3a3323`](https://github.com/ts-graphviz/ts-graphviz/commit/b3a3323c70e72c87b7728684a5862b5d6e54fbb9)]:
  - ts-graphviz@2.1.4
  - @ts-graphviz/common@2.1.4

## 0.10.3

### Patch Changes

- [#1087](https://github.com/ts-graphviz/ts-graphviz/pull/1087) [`f808a2e`](https://github.com/ts-graphviz/ts-graphviz/commit/f808a2e93f52a97e3466afc37d5353b2d7d8c54c) Thanks [@kamiazya](https://github.com/kamiazya)! - Fix global JSX type

- [#1088](https://github.com/ts-graphviz/ts-graphviz/pull/1088) [`7d7352b`](https://github.com/ts-graphviz/ts-graphviz/commit/7d7352bb3819522ba16763503aa6bc923f550408) Thanks [@kamiazya](https://github.com/kamiazya)! - Update Snapshot release configuration

- Updated dependencies [[`883f7b3`](https://github.com/ts-graphviz/ts-graphviz/commit/883f7b3c65794b3ab2b01c422b6231079bb6c28d), [`7705b1d`](https://github.com/ts-graphviz/ts-graphviz/commit/7705b1d08612aef83e1c35bc3ee4ffc922247a27), [`7d7352b`](https://github.com/ts-graphviz/ts-graphviz/commit/7d7352bb3819522ba16763503aa6bc923f550408)]:
  - @ts-graphviz/common@2.1.3
  - ts-graphviz@2.1.3

## 0.10.2

### Patch Changes

- [#1020](https://github.com/ts-graphviz/ts-graphviz/pull/1020) [`7035af8`](https://github.com/ts-graphviz/ts-graphviz/commit/7035af80c275f8e3dd7e94fa2bfd22de45a96d67) Thanks [@kamiazya](https://github.com/kamiazya)! - Support Node.js v22

- Updated dependencies [[`4b3c7d4`](https://github.com/ts-graphviz/ts-graphviz/commit/4b3c7d46e49a18ca05d6ecacbfa13d550039419f), [`70bbd56`](https://github.com/ts-graphviz/ts-graphviz/commit/70bbd5673da3b83c3655e5f0d23454af6a8dc1d1), [`fb6789b`](https://github.com/ts-graphviz/ts-graphviz/commit/fb6789b82ce3bc890fa93a59b7d3fb3dc6417b5e), [`7035af8`](https://github.com/ts-graphviz/ts-graphviz/commit/7035af80c275f8e3dd7e94fa2bfd22de45a96d67), [`54f6569`](https://github.com/ts-graphviz/ts-graphviz/commit/54f6569c58a91410da97177a6735a1e414467ddd)]:
  - ts-graphviz@2.1.2
  - @ts-graphviz/common@2.1.2

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
