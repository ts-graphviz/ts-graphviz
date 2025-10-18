# @ts-graphviz/common

## 3.0.3

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

## 3.0.2

### Patch Changes

- [#1483](https://github.com/ts-graphviz/ts-graphviz/pull/1483) [`a07d3b7`](https://github.com/ts-graphviz/ts-graphviz/commit/a07d3b7037d08bcb99679562468e16e5af0968ba) Thanks [@kamiazya](https://github.com/kamiazya)! - Fix CI workflow to prevent @next tag publishing after Version Packages PR merge

## 3.0.1

### Patch Changes

- [#1480](https://github.com/ts-graphviz/ts-graphviz/pull/1480) [`ab5d0c7`](https://github.com/ts-graphviz/ts-graphviz/commit/ab5d0c75620a0fd1bf36373716b26c2d433a0bc6) Thanks [@kamiazya](https://github.com/kamiazya)! - Fix CI workflow to prevent publishing stable releases with @next tag

## 3.0.0

### Major Changes

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

### Minor Changes

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

- [#1363](https://github.com/ts-graphviz/ts-graphviz/pull/1363) [`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c) Thanks [@kamiazya](https://github.com/kamiazya)! - Export type guard and node reference utility APIs

  ## New Public APIs

  ### Type Guard Functions

  - **`isNodeModel(object: unknown): object is NodeModel`** - Type guard for NodeModel objects
  - **`isEdgeModel(object: unknown): object is EdgeModel`** - Type guard for EdgeModel objects
  - **`isSubgraphModel(object: unknown): object is SubgraphModel`** - Type guard for SubgraphModel objects
  - **`isRootGraphModel(object: unknown): object is RootGraphModel`** - Type guard for RootGraphModel objects
  - **`isAttributeListModel(object: unknown): object is AttributeListModel`** - Type guard for AttributeListModel objects

  ### Node Reference Utilities

  - **`isForwardRefNode(object: unknown): object is ForwardRefNode`** - Type guard for ForwardRefNode objects
  - **`isNodeRef(node: unknown): node is NodeRef`** - Type guard for NodeRef objects (NodeModel or ForwardRefNode)
  - **`isNodeRefLike(node: unknown): node is NodeRefLike`** - Type guard for NodeRefLike objects (string or NodeRef)
  - **`isNodeRefGroupLike(target: NodeRefLike | NodeRefGroupLike): target is NodeRefGroupLike`** - Type guard for arrays of NodeRefLike
  - **`isCompass(c: string): c is Compass`** - Type guard for valid compass directions ('n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', 'c')

  ### Conversion Utilities

  - **`toNodeRef(target: NodeRefLike): NodeRef`** - Converts NodeRefLike to structured NodeRef object
  - **`toNodeRefGroup(targets: NodeRefGroupLike): NodeRefGroup`** - Converts array of NodeRefLike to array of NodeRef objects

  ### New Types

  - **`FilterableModel`** - Union type of all model types that can be filtered using type guards

  ## Features

  - **Enhanced Type Safety**: All functions provide strict runtime type checking with TypeScript type narrowing
  - **Comprehensive Documentation**: Full JSDoc comments with usage examples for all public APIs
  - **Node Reference Parsing**: Parse complex node reference strings like `"node1:port:n"` into structured objects
  - **Compass Direction Validation**: Validate and work with Graphviz compass directions

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

## 2.1.5

### Patch Changes

- [#1218](https://github.com/ts-graphviz/ts-graphviz/pull/1218) [`d7ff421`](https://github.com/ts-graphviz/ts-graphviz/commit/d7ff421ec861ca8fdede1a6bdf256f3455fb9797) Thanks [@kamiazya](https://github.com/kamiazya)! - Remove unnecessary internal utility functions

## 2.1.4

### Patch Changes

- [#1179](https://github.com/ts-graphviz/ts-graphviz/pull/1179) [`f48ae4a`](https://github.com/ts-graphviz/ts-graphviz/commit/f48ae4a36fde430cf4a4769189243acd76560946) Thanks [@kamiazya](https://github.com/kamiazya)! - build(deps-dev): bump vite-plugin-dts from 3.9.1 to 4.2.1

- [#1213](https://github.com/ts-graphviz/ts-graphviz/pull/1213) [`b44aa66`](https://github.com/ts-graphviz/ts-graphviz/commit/b44aa66d46a0a5240384e70b986ce3e7d0a02218) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump vitest and @vitest/coverage-istanbul

- [#1214](https://github.com/ts-graphviz/ts-graphviz/pull/1214) [`b3a3323`](https://github.com/ts-graphviz/ts-graphviz/commit/b3a3323c70e72c87b7728684a5862b5d6e54fbb9) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump vite from 5.2.8 to 5.4.8

## 2.1.3

### Patch Changes

- [#1158](https://github.com/ts-graphviz/ts-graphviz/pull/1158) [`883f7b3`](https://github.com/ts-graphviz/ts-graphviz/commit/883f7b3c65794b3ab2b01c422b6231079bb6c28d) Thanks [@kamiazya](https://github.com/kamiazya)! - Fix EdgeTargets validation in toNodeRefGroup function

- [#1088](https://github.com/ts-graphviz/ts-graphviz/pull/1088) [`7d7352b`](https://github.com/ts-graphviz/ts-graphviz/commit/7d7352bb3819522ba16763503aa6bc923f550408) Thanks [@kamiazya](https://github.com/kamiazya)! - Update Snapshot release configuration

## 2.1.2

### Patch Changes

- [#1018](https://github.com/ts-graphviz/ts-graphviz/pull/1018) [`4b3c7d4`](https://github.com/ts-graphviz/ts-graphviz/commit/4b3c7d46e49a18ca05d6ecacbfa13d550039419f) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump lefthook from 1.6.7 to 1.6.10

- [#1022](https://github.com/ts-graphviz/ts-graphviz/pull/1022) [`70bbd56`](https://github.com/ts-graphviz/ts-graphviz/commit/70bbd5673da3b83c3655e5f0d23454af6a8dc1d1) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump @types/node from 20.11.24 to 20.12.7

- [#1023](https://github.com/ts-graphviz/ts-graphviz/pull/1023) [`fb6789b`](https://github.com/ts-graphviz/ts-graphviz/commit/fb6789b82ce3bc890fa93a59b7d3fb3dc6417b5e) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump typescript from 5.3.3 to 5.4.5

- [#1020](https://github.com/ts-graphviz/ts-graphviz/pull/1020) [`7035af8`](https://github.com/ts-graphviz/ts-graphviz/commit/7035af80c275f8e3dd7e94fa2bfd22de45a96d67) Thanks [@kamiazya](https://github.com/kamiazya)! - Support Node.js v22

- [#1025](https://github.com/ts-graphviz/ts-graphviz/pull/1025) [`54f6569`](https://github.com/ts-graphviz/ts-graphviz/commit/54f6569c58a91410da97177a6735a1e414467ddd) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump vitest and @vitest/coverage-istanbul

## 2.1.1

### Patch Changes

- [#1003](https://github.com/ts-graphviz/ts-graphviz/pull/1003) [`24f4174`](https://github.com/ts-graphviz/ts-graphviz/commit/24f4174a76eaef50fc7d30ae3401c1b23b00789b) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump vite from 5.1.3 to 5.2.8

- [#1004](https://github.com/ts-graphviz/ts-graphviz/pull/1004) [`fabb8c8`](https://github.com/ts-graphviz/ts-graphviz/commit/fabb8c8b9f3ded57d41d7d4f1d669084ab4e91c9) Thanks [@kamiazya](https://github.com/kamiazya)! - Fix documentation build failed

## 2.1.0

### Minor Changes

- [#992](https://github.com/ts-graphviz/ts-graphviz/pull/992) [`391e98e`](https://github.com/ts-graphviz/ts-graphviz/commit/391e98edf70bb43c1feb4a00f832fa9d96dd9d39) Thanks [@kamiazya](https://github.com/kamiazya)! - Add HTMLLikeLabel types

### Patch Changes

- [#967](https://github.com/ts-graphviz/ts-graphviz/pull/967) [`cb5517a`](https://github.com/ts-graphviz/ts-graphviz/commit/cb5517a0236ce33527d200df9770390f4eb40064) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump webpack from 5.90.2 to 5.90.3

- [#971](https://github.com/ts-graphviz/ts-graphviz/pull/971) [`0589b4f`](https://github.com/ts-graphviz/ts-graphviz/commit/0589b4f8849290d2c4a39beceb9b633f059f2e3f) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump actions/download-artifact from 4.1.3 to 4.1.4

- [#979](https://github.com/ts-graphviz/ts-graphviz/pull/979) [`5ce6b59`](https://github.com/ts-graphviz/ts-graphviz/commit/5ce6b59fa395bc344de2bfb15061b158a9ea5586) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump actions/upload-artifact from 3.1.0 to 4.3.1

- [#980](https://github.com/ts-graphviz/ts-graphviz/pull/980) [`122336b`](https://github.com/ts-graphviz/ts-graphviz/commit/122336bede1033f73a2a94c82d499fda238f6b2e) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump ossf/scorecard-action from 2.1.2 to 2.3.1

- [#981](https://github.com/ts-graphviz/ts-graphviz/pull/981) [`b5f36fa`](https://github.com/ts-graphviz/ts-graphviz/commit/b5f36faf9cf70dfc263130c4480dc21770475c5a) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump github/codeql-action from 2.2.4 to 3.24.6

- [#982](https://github.com/ts-graphviz/ts-graphviz/pull/982) [`c55f2d0`](https://github.com/ts-graphviz/ts-graphviz/commit/c55f2d0dfa851d318cc16a36499c69c0a34f1588) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump actions/checkout from 3.1.0 to 4.1.1

- [#986](https://github.com/ts-graphviz/ts-graphviz/pull/986) [`81a50ff`](https://github.com/ts-graphviz/ts-graphviz/commit/81a50ff94b461f44256f2eea5b86af5eb26afd94) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps): bump actions/dependency-review-action from 2.5.1 to 4.1.3

- [#993](https://github.com/ts-graphviz/ts-graphviz/pull/993) [`a16f047`](https://github.com/ts-graphviz/ts-graphviz/commit/a16f047dfdd5db73f3e25847cf3fb2f8075aaf11) Thanks [@kamiazya](https://github.com/kamiazya)! - ## Some changes

  - Add scorecard workflow https://github.com/ts-graphviz/ts-graphviz/pull/975
  - Update devcontainer.json to remove deno.cache path https://github.com/ts-graphviz/ts-graphviz/pull/974

- [#993](https://github.com/ts-graphviz/ts-graphviz/pull/993) [`a16f047`](https://github.com/ts-graphviz/ts-graphviz/commit/a16f047dfdd5db73f3e25847cf3fb2f8075aaf11) Thanks [@kamiazya](https://github.com/kamiazya)! - Fix export styles

## 2.0.0

> It is part of the ts-graphviz library, which is split into modular packages to improve maintainability, flexibility, and ease of use.

This package contains type information, constants, and utility functions related to the DOT language attributes, attribute values, and models for ts-graphviz.

## Features

- Type definitions for DOT language elements, such as attributes and attribute values
- Constants representing common attribute names and values
- Utility functions for working with DOT language elements

## Usage

Import the necessary types, constants, or utility functions from the `@ts-graphviz/common` package:

```ts
import {
  NodeAttributesObject,
  EdgeAttributesObject,
} from "@ts-graphviz/common";
```

Use the imported items in your project to work with the DOT language elements:

```ts
const nodeAttr: NodeAttributesObject = {
  label: "Node label",
  shape: "ellipse",
};

const edgeAttr: EdgeAttributesObject = {
  label: "Edge label",
  color: "red",
};
```
