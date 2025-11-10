# ts-graphviz

## 3.0.6

### Patch Changes

- [#1536](https://github.com/ts-graphviz/ts-graphviz/pull/1536) [`4296b4e`](https://github.com/ts-graphviz/ts-graphviz/commit/4296b4e0cf17f36cc385c2ce93ec7ec89bd4a73a) Thanks [@kamiazya](https://github.com/kamiazya)! - Add null byte sanitization and comprehensive security tests for DOT injection prevention

  ## Security Fix

  ### Null Byte Handling

  Added null byte removal to the `escape()` function to prevent Graphviz parsing errors. Graphviz treats null bytes (`\0`) as string terminators, causing syntax errors when encountered in quoted strings. This is now consistent with the `escapeComment()` function which already strips null bytes.

  **Why this matters:**

  - Prevents "syntax error in line X scanning a quoted string" errors in Graphviz
  - Removes potential attack vector for causing parser failures
  - Aligns with existing comment sanitization behavior

  ## Test Coverage Additions

  ### Unit Tests (escape.test.ts)

  Added 16 new test cases covering various DOT injection attack vectors:

  - Semicolon-based statement injection
  - Edge operator injection attempts
  - Graph termination injection via quotes and newlines
  - Closing brace injection
  - Attribute injection with equals sign
  - Multiple quote injection attempts
  - Mixed newlines and quotes
  - Subgraph injection attempts
  - Edge chain injection
  - HTML-like label injection with quotes
  - Port injection
  - Already-escaped string handling
  - Null byte removal (2 tests)
  - Unicode strings with quotes
  - Strict keyword injection

  ### Integration Tests (to-dot.test.ts)

  Added 10 new end-to-end test cases:

  - Statement injection in node IDs (semicolon)
  - Edge operator injection in node IDs
  - Graph termination injection via quotes and newlines
  - Statement injection in subgraph IDs
  - Attribute value injection prevention
  - Edge ID injection prevention
  - Multiple quotes in node ID
  - Port specification injection
  - Graph comment injection
  - Node comment injection

  ## Validation

  All tests confirm that the existing escape implementation correctly prevents DOT language injection by:

  - Escaping double quotes (`"` → `\"`)
  - Escaping newlines (`\n` → `\n`)
  - Escaping carriage returns (`\r` → `\r`)
  - Ensuring malicious strings are treated as literal identifiers, not DOT syntax

  Verified with actual Graphviz parser (version 13.1.1) that escaped output renders safely without executing injected DOT code.

- [#1532](https://github.com/ts-graphviz/ts-graphviz/pull/1532) [`dc3ef34`](https://github.com/ts-graphviz/ts-graphviz/commit/dc3ef34316f5642c416711cb6a50704dbef7bb64) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump vite from 7.0.2 to 7.0.8 in the npm_and_yarn group across 1 directory

- Updated dependencies [[`4296b4e`](https://github.com/ts-graphviz/ts-graphviz/commit/4296b4e0cf17f36cc385c2ce93ec7ec89bd4a73a), [`ed770be`](https://github.com/ts-graphviz/ts-graphviz/commit/ed770be7fffc93b9171198c9a84270df7477185d), [`dc3ef34`](https://github.com/ts-graphviz/ts-graphviz/commit/dc3ef34316f5642c416711cb6a50704dbef7bb64), [`11f7126`](https://github.com/ts-graphviz/ts-graphviz/commit/11f7126347816f64f7892c8608b5e3bf1a826670)]:
  - @ts-graphviz/ast@3.0.5
  - @ts-graphviz/adapter@3.0.5
  - @ts-graphviz/common@3.0.4
  - @ts-graphviz/core@3.0.6

## 3.0.5

### Patch Changes

- Updated dependencies [[`6966a66`](https://github.com/ts-graphviz/ts-graphviz/commit/6966a6699e87e2c74e7348aa6fdc2c50ae11b308), [`c4a08b9`](https://github.com/ts-graphviz/ts-graphviz/commit/c4a08b9f6bbe9104a461d5dc599ca307f6940f7c), [`00aaf2f`](https://github.com/ts-graphviz/ts-graphviz/commit/00aaf2ff6ef6fa8b6611ec2a477bc46b76fdebaf), [`52e3f1f`](https://github.com/ts-graphviz/ts-graphviz/commit/52e3f1ff58a77bf9bd9a0d0b6e29edb20e3700e5)]:
  - @ts-graphviz/adapter@3.0.4
  - @ts-graphviz/ast@3.0.4
  - @ts-graphviz/core@3.0.5

## 3.0.4

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

- [#1506](https://github.com/ts-graphviz/ts-graphviz/pull/1506) [`1b94e27`](https://github.com/ts-graphviz/ts-graphviz/commit/1b94e27674bf33b8e605c54eef6f05c5dd95852a) Thanks [@ktej721](https://github.com/ktej721)! - docs(ts-graphviz): correct malformed JSDoc comment in model-factory.ts

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

- Updated dependencies [[`9d52d28`](https://github.com/ts-graphviz/ts-graphviz/commit/9d52d282031ed173a75ef0fb77ddea9677f78520), [`d74172a`](https://github.com/ts-graphviz/ts-graphviz/commit/d74172a594531f071b7e06c079b6555d867bf683), [`de566db`](https://github.com/ts-graphviz/ts-graphviz/commit/de566db993e1f62325f3a4afdbde178b86a96509), [`48a9fba`](https://github.com/ts-graphviz/ts-graphviz/commit/48a9fba55522d02ea3c4d62321e2555943971b88), [`9f72aed`](https://github.com/ts-graphviz/ts-graphviz/commit/9f72aededee9c45b32f2e8e7f4c16c561e04d60a)]:
  - @ts-graphviz/adapter@3.0.3
  - @ts-graphviz/ast@3.0.3
  - @ts-graphviz/common@3.0.3
  - @ts-graphviz/core@3.0.4

## 3.0.2

### Patch Changes

- [#1483](https://github.com/ts-graphviz/ts-graphviz/pull/1483) [`a07d3b7`](https://github.com/ts-graphviz/ts-graphviz/commit/a07d3b7037d08bcb99679562468e16e5af0968ba) Thanks [@kamiazya](https://github.com/kamiazya)! - Fix CI workflow to prevent @next tag publishing after Version Packages PR merge

- Updated dependencies [[`a07d3b7`](https://github.com/ts-graphviz/ts-graphviz/commit/a07d3b7037d08bcb99679562468e16e5af0968ba)]:
  - @ts-graphviz/adapter@3.0.2
  - @ts-graphviz/ast@3.0.2
  - @ts-graphviz/common@3.0.2
  - @ts-graphviz/core@3.0.2

## 3.0.1

### Patch Changes

- [#1480](https://github.com/ts-graphviz/ts-graphviz/pull/1480) [`ab5d0c7`](https://github.com/ts-graphviz/ts-graphviz/commit/ab5d0c75620a0fd1bf36373716b26c2d433a0bc6) Thanks [@kamiazya](https://github.com/kamiazya)! - Fix CI workflow to prevent publishing stable releases with @next tag

- Updated dependencies [[`c9653aa`](https://github.com/ts-graphviz/ts-graphviz/commit/c9653aa75cb13a91d6a6bcbd8b64161cfd0273b5), [`ab5d0c7`](https://github.com/ts-graphviz/ts-graphviz/commit/ab5d0c75620a0fd1bf36373716b26c2d433a0bc6)]:
  - @ts-graphviz/ast@3.0.1
  - @ts-graphviz/adapter@3.0.1
  - @ts-graphviz/common@3.0.1
  - @ts-graphviz/core@3.0.1

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

- Updated dependencies [[`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c), [`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c), [`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c), [`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c), [`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c), [`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c), [`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c)]:
  - @ts-graphviz/adapter@3.0.0
  - @ts-graphviz/common@3.0.0
  - @ts-graphviz/core@3.0.0
  - @ts-graphviz/ast@3.0.0

## 2.1.6

### Patch Changes

- Updated dependencies [[`c043ba9`](https://github.com/ts-graphviz/ts-graphviz/commit/c043ba9bcc5194a89b976df1609c4e9875300f1e)]:
  - @ts-graphviz/ast@2.0.7
  - @ts-graphviz/core@2.0.7

## 2.1.5

### Patch Changes

- Updated dependencies [[`d7ff421`](https://github.com/ts-graphviz/ts-graphviz/commit/d7ff421ec861ca8fdede1a6bdf256f3455fb9797), [`d7ff421`](https://github.com/ts-graphviz/ts-graphviz/commit/d7ff421ec861ca8fdede1a6bdf256f3455fb9797)]:
  - @ts-graphviz/ast@2.0.6
  - @ts-graphviz/common@2.1.5
  - @ts-graphviz/core@2.0.6
  - @ts-graphviz/adapter@2.0.6

## 2.1.4

### Patch Changes

- [#1205](https://github.com/ts-graphviz/ts-graphviz/pull/1205) [`9608151`](https://github.com/ts-graphviz/ts-graphviz/commit/9608151b1325484dbd01d5c902e91555219cc3cb) Thanks [@kamiazya](https://github.com/kamiazya)! - Update CI Badge URL

- [#1179](https://github.com/ts-graphviz/ts-graphviz/pull/1179) [`f48ae4a`](https://github.com/ts-graphviz/ts-graphviz/commit/f48ae4a36fde430cf4a4769189243acd76560946) Thanks [@kamiazya](https://github.com/kamiazya)! - build(deps-dev): bump vite-plugin-dts from 3.9.1 to 4.2.1

- [#1213](https://github.com/ts-graphviz/ts-graphviz/pull/1213) [`b44aa66`](https://github.com/ts-graphviz/ts-graphviz/commit/b44aa66d46a0a5240384e70b986ce3e7d0a02218) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump vitest and @vitest/coverage-istanbul

- [#1214](https://github.com/ts-graphviz/ts-graphviz/pull/1214) [`b3a3323`](https://github.com/ts-graphviz/ts-graphviz/commit/b3a3323c70e72c87b7728684a5862b5d6e54fbb9) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump vite from 5.2.8 to 5.4.8

- Updated dependencies [[`03bafa0`](https://github.com/ts-graphviz/ts-graphviz/commit/03bafa0e10b43807b5568df4ffba720752a0ac02), [`6bb5ab1`](https://github.com/ts-graphviz/ts-graphviz/commit/6bb5ab18682daa1410de4a35edc22316487989af), [`f48ae4a`](https://github.com/ts-graphviz/ts-graphviz/commit/f48ae4a36fde430cf4a4769189243acd76560946), [`b44aa66`](https://github.com/ts-graphviz/ts-graphviz/commit/b44aa66d46a0a5240384e70b986ce3e7d0a02218), [`b3a3323`](https://github.com/ts-graphviz/ts-graphviz/commit/b3a3323c70e72c87b7728684a5862b5d6e54fbb9)]:
  - @ts-graphviz/ast@2.0.5
  - @ts-graphviz/adapter@2.0.5
  - @ts-graphviz/common@2.1.4
  - @ts-graphviz/core@2.0.5

## 2.1.3

### Patch Changes

- [#1057](https://github.com/ts-graphviz/ts-graphviz/pull/1057) [`7705b1d`](https://github.com/ts-graphviz/ts-graphviz/commit/7705b1d08612aef83e1c35bc3ee4ffc922247a27) Thanks [@kamiazya](https://github.com/kamiazya)! - Update README

- [#1088](https://github.com/ts-graphviz/ts-graphviz/pull/1088) [`7d7352b`](https://github.com/ts-graphviz/ts-graphviz/commit/7d7352bb3819522ba16763503aa6bc923f550408) Thanks [@kamiazya](https://github.com/kamiazya)! - Update Snapshot release configuration

- Updated dependencies [[`883f7b3`](https://github.com/ts-graphviz/ts-graphviz/commit/883f7b3c65794b3ab2b01c422b6231079bb6c28d), [`7d7352b`](https://github.com/ts-graphviz/ts-graphviz/commit/7d7352bb3819522ba16763503aa6bc923f550408)]:
  - @ts-graphviz/common@2.1.3
  - @ts-graphviz/adapter@2.0.4
  - @ts-graphviz/ast@2.0.4
  - @ts-graphviz/core@2.0.4

## 2.1.2

### Patch Changes

- [#1018](https://github.com/ts-graphviz/ts-graphviz/pull/1018) [`4b3c7d4`](https://github.com/ts-graphviz/ts-graphviz/commit/4b3c7d46e49a18ca05d6ecacbfa13d550039419f) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump lefthook from 1.6.7 to 1.6.10

- [#1022](https://github.com/ts-graphviz/ts-graphviz/pull/1022) [`70bbd56`](https://github.com/ts-graphviz/ts-graphviz/commit/70bbd5673da3b83c3655e5f0d23454af6a8dc1d1) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump @types/node from 20.11.24 to 20.12.7

- [#1023](https://github.com/ts-graphviz/ts-graphviz/pull/1023) [`fb6789b`](https://github.com/ts-graphviz/ts-graphviz/commit/fb6789b82ce3bc890fa93a59b7d3fb3dc6417b5e) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump typescript from 5.3.3 to 5.4.5

- [#1020](https://github.com/ts-graphviz/ts-graphviz/pull/1020) [`7035af8`](https://github.com/ts-graphviz/ts-graphviz/commit/7035af80c275f8e3dd7e94fa2bfd22de45a96d67) Thanks [@kamiazya](https://github.com/kamiazya)! - Support Node.js v22

- [#1025](https://github.com/ts-graphviz/ts-graphviz/pull/1025) [`54f6569`](https://github.com/ts-graphviz/ts-graphviz/commit/54f6569c58a91410da97177a6735a1e414467ddd) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump vitest and @vitest/coverage-istanbul

- Updated dependencies [[`4b3c7d4`](https://github.com/ts-graphviz/ts-graphviz/commit/4b3c7d46e49a18ca05d6ecacbfa13d550039419f), [`70bbd56`](https://github.com/ts-graphviz/ts-graphviz/commit/70bbd5673da3b83c3655e5f0d23454af6a8dc1d1), [`fb6789b`](https://github.com/ts-graphviz/ts-graphviz/commit/fb6789b82ce3bc890fa93a59b7d3fb3dc6417b5e), [`7035af8`](https://github.com/ts-graphviz/ts-graphviz/commit/7035af80c275f8e3dd7e94fa2bfd22de45a96d67), [`54f6569`](https://github.com/ts-graphviz/ts-graphviz/commit/54f6569c58a91410da97177a6735a1e414467ddd)]:
  - @ts-graphviz/core@2.0.3
  - @ts-graphviz/common@2.1.2
  - @ts-graphviz/ast@2.0.3
  - @ts-graphviz/adapter@2.0.3

## 2.1.1

### Patch Changes

- [#1003](https://github.com/ts-graphviz/ts-graphviz/pull/1003) [`24f4174`](https://github.com/ts-graphviz/ts-graphviz/commit/24f4174a76eaef50fc7d30ae3401c1b23b00789b) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump vite from 5.1.3 to 5.2.8

- [#1004](https://github.com/ts-graphviz/ts-graphviz/pull/1004) [`fabb8c8`](https://github.com/ts-graphviz/ts-graphviz/commit/fabb8c8b9f3ded57d41d7d4f1d669084ab4e91c9) Thanks [@kamiazya](https://github.com/kamiazya)! - Fix documentation build failed

- Updated dependencies [[`24f4174`](https://github.com/ts-graphviz/ts-graphviz/commit/24f4174a76eaef50fc7d30ae3401c1b23b00789b), [`fabb8c8`](https://github.com/ts-graphviz/ts-graphviz/commit/fabb8c8b9f3ded57d41d7d4f1d669084ab4e91c9)]:
  - @ts-graphviz/core@2.0.2
  - @ts-graphviz/common@2.1.1
  - @ts-graphviz/ast@2.0.2
  - @ts-graphviz/adapter@2.0.2

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

- [#993](https://github.com/ts-graphviz/ts-graphviz/pull/993) [`a16f047`](https://github.com/ts-graphviz/ts-graphviz/commit/a16f047dfdd5db73f3e25847cf3fb2f8075aaf11) Thanks [@kamiazya](https://github.com/kamiazya)! - Remove pegjs devDependencies

- [#993](https://github.com/ts-graphviz/ts-graphviz/pull/993) [`a16f047`](https://github.com/ts-graphviz/ts-graphviz/commit/a16f047dfdd5db73f3e25847cf3fb2f8075aaf11) Thanks [@kamiazya](https://github.com/kamiazya)! - ## Some changes

  - Add scorecard workflow https://github.com/ts-graphviz/ts-graphviz/pull/975
  - Update devcontainer.json to remove deno.cache path https://github.com/ts-graphviz/ts-graphviz/pull/974

- [#993](https://github.com/ts-graphviz/ts-graphviz/pull/993) [`a16f047`](https://github.com/ts-graphviz/ts-graphviz/commit/a16f047dfdd5db73f3e25847cf3fb2f8075aaf11) Thanks [@kamiazya](https://github.com/kamiazya)! - Fix export styles

- Updated dependencies [[`cb5517a`](https://github.com/ts-graphviz/ts-graphviz/commit/cb5517a0236ce33527d200df9770390f4eb40064), [`0589b4f`](https://github.com/ts-graphviz/ts-graphviz/commit/0589b4f8849290d2c4a39beceb9b633f059f2e3f), [`5ce6b59`](https://github.com/ts-graphviz/ts-graphviz/commit/5ce6b59fa395bc344de2bfb15061b158a9ea5586), [`122336b`](https://github.com/ts-graphviz/ts-graphviz/commit/122336bede1033f73a2a94c82d499fda238f6b2e), [`b5f36fa`](https://github.com/ts-graphviz/ts-graphviz/commit/b5f36faf9cf70dfc263130c4480dc21770475c5a), [`c55f2d0`](https://github.com/ts-graphviz/ts-graphviz/commit/c55f2d0dfa851d318cc16a36499c69c0a34f1588), [`81a50ff`](https://github.com/ts-graphviz/ts-graphviz/commit/81a50ff94b461f44256f2eea5b86af5eb26afd94), [`391e98e`](https://github.com/ts-graphviz/ts-graphviz/commit/391e98edf70bb43c1feb4a00f832fa9d96dd9d39), [`a16f047`](https://github.com/ts-graphviz/ts-graphviz/commit/a16f047dfdd5db73f3e25847cf3fb2f8075aaf11), [`a16f047`](https://github.com/ts-graphviz/ts-graphviz/commit/a16f047dfdd5db73f3e25847cf3fb2f8075aaf11)]:
  - @ts-graphviz/core@2.0.1
  - @ts-graphviz/common@2.1.0
  - @ts-graphviz/ast@2.0.1
  - @ts-graphviz/adapter@2.0.1

## 2.0.0

### Major Changes

- [#956](https://github.com/ts-graphviz/ts-graphviz/pull/956) [`1e4f57a`](https://github.com/ts-graphviz/ts-graphviz/commit/1e4f57aee8a97fa79240c002ef4925b0fa6a0548) Thanks [@kamiazya](https://github.com/kamiazya)! - # ts-graphviz v2

  ## Why?

  ### Dropping support for Node.js 14 & 16

  We are introducing a major version upgrade to ts-graphviz to ensure better performance, security, and compatibility with the latest improvements in the JavaScript ecosystem. With this upgrade, we will no longer support Node.js 14 & 16, which has reached its End-of-Life (EOL), and set the new minimum guaranteed version to **Node.js 18**.

  This major version upgrade is necessary due to the following reasons:

  1. **Breaking Change**: Dropping support for Node.js 14 & 16 is considered a breaking change, which requires a major version upgrade according to semantic versioning principles.

  2. **Improved Stability and Performance**: By focusing on LTS versions, we can provide a library that benefits from the stability, long-term support, and performance improvements provided by newer Node.js versions.

  3. **Security**: Ensuring that our library is compatible with the latest supported Node.js versions helps to minimize potential security vulnerabilities.

  To help our users understand our approach to Node.js version support, we have established a clear [Node.js Version Support Policy](#nodejs-version-support-policy) for ts-graphviz.

  We encourage our users to update their projects to the latest LTS version of Node.js to ensure the best performance, security, and compatibility with ts-graphviz.

  ## Key Concepts

  ts-graphviz is a TypeScript library designed to create, manipulate, and render Graphviz DOT language graphs.

  It is built around several key concepts that make it modular, extensible, and easy to use:

  1. **TypeScript-First Design & Type Definitions**: ts-graphviz is designed with TypeScript as its primary language, providing strong typing and ensuring seamless integration with TypeScript projects. This enables users to leverage the full power of TypeScript's type system and tooling while working with Graphviz graphs. The library includes comprehensive type definitions for DOT language elements, making it easier to work with Graphviz elements in a type-safe manner.

  2. **Object-Oriented API**: ts-graphviz provides an object-oriented API for creating and manipulating graph elements like graphs, nodes, and edges. This enables users to work with complex graph structures intuitively and efficiently.

  3. **Modular Design[New in v2]**: The library is split into multiple packages, each serving a specific purpose. This modular design allows users to pick and choose the functionality they need, resulting in improved maintainability and flexibility.

  4. **AST Support**: ts-graphviz includes a module for processing DOT language at the Abstract Syntax Tree (AST) level. This feature allows users to parse and generate DOT language while preserving its structure, making it easier to manipulate and transform graphs programmatically.

  5. **Runtime Adapter**: The library provides adapter functions that enable users to execute Graphviz commands across different runtime environments, such as Node.js and Deno. These adapter functions serve as a wrapper, allowing for seamless integration with various platforms.

  6. **Extensibility**: ts-graphviz has been designed with extensibility in mind, allowing users to extend its functionality with custom implementations for specific use cases.

  7. **Multi-Paradigm Support**: ts-graphviz is designed to accommodate various programming paradigms, such as Object-Oriented Programming, Declarative Programming, and Functional Programming. This ensures that users can choose the programming style that best suits their needs and preferences, making it adaptable and versatile across different use cases and development approaches.

  By combining these key concepts, ts-graphviz aims to provide a powerful and user-friendly tool for working with Graphviz DOT language in TypeScript projects.

  # What's changed?

  ## Package splitting and monorepo-ization

  ### Purpose

  The purpose of package splitting and monorepo-ization in the ts-graphviz v2 is to achieve the following objectives:

  - **Improved modularity**: By separating functionality into distinct packages, the library becomes more modular. This allows users to install and use only the specific components they need, reducing unnecessary dependencies and improving overall performance.
  - **Easier maintainability**: Splitting the library into smaller packages makes it easier for developers to maintain and update each package independently. This allows for faster bug fixes, feature enhancements, and more efficient development cycles.
  - **Clearer dependencies**: Package splitting results in a more explicit dependency structure between components, making it easier for developers to understand and manage dependencies within the project.
  - **Increased flexibility**: With a modular package structure, users can choose to use only the features they need, making it easier to integrate ts-graphviz into a broader range of projects and applications.
  - **Simplified collaboration**: By breaking down the library into separate packages within a monorepo, contributors can focus on specific areas of interest without interfering with other parts of the library. This facilitates collaboration and encourages more developers to contribute to the project.
  - **Centralized management**: Monorepo-ization allows for the centralized management of all the packages. This enables developers to track issues, manage pull requests, and maintain documentation in a single location, increasing efficiency and reducing overhead.
  - **Consistent versioning and releases**: Monorepo-ization ensures that versioning and release processes are consistent across all packages, making it easier to maintain and update the library as a whole.

  Overall, package splitting and monorepo-ization aim to create a more robust, maintainable, and user-friendly library that better serves the needs of the ts-graphviz community.

  ### Packages

  In v2 of ts-graphviz, the library functionality will be split into several packages. The packages to be split are as follows:

  - **@ts-graphviz/common**: Contains type information related to DOT language attributes, attribute values, and models.
  - **@ts-graphviz/ast**: Includes the module for processing DOT language at the AST (Abstract Syntax Tree) level.
  - **@ts-graphviz/core**: Comprises the implementation of models and functions provided to users.
  - **@ts-graphviz/adapter**: Handles runtime-dependent processing. For example, it provides I/O processing related to image generation in Graphviz on different runtimes, such as Node.js and Deno.

  To ensure that existing users are not affected, the ts-graphviz package will remain available. This change will result in a clear division of functionality and will improve the scalability and maintainability of the project. However, users of previous versions and users who wish to use the library without extending it will be able to continue to use the ts-graphviz package as is.

  - **ts-graphviz**: The main package that serves as the entry point for users. It provides a high-level API for creating, manipulating, and rendering Graphviz DOT language graphs. This package depends on the other packages to provide its functionality.

  Please note that while we strive to maintain compatibility, there might be some minor differences or limitations in the compatibility package compared to the original ts-graphviz library. It is essential to review the documentation and update your code accordingly if needed, but only when you decide to migrate to the new package structure.

  ### Dependency graph

  | Package                                                                    | Summary                                         | Description                                                                                                                                                     |
  | -------------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | [ts-graphviz](https://www.npmjs.com/package/ts-graphviz)                   | Graphviz library for TypeScript                 | The main package that serves as the entry point for users. It provides a high-level API for creating, manipulating, and rendering Graphviz DOT language graphs. |
  | [@ts-graphviz/common](https://www.npmjs.com/package/@ts-graphviz/common)   | Graphviz Types and Utilities                    | Contains type information related to DOT language attributes, attribute values, and models.                                                                     |
  | [@ts-graphviz/ast](https://www.npmjs.com/package/@ts-graphviz/ast)         | Graphviz AST(Abstract Syntax Tree) Utilities    | Includes the module for processing DOT language at the AST (Abstract Syntax Tree) level.                                                                        |
  | [@ts-graphviz/core](https://www.npmjs.com/package/@ts-graphviz/core)       | Graphviz Models for Object-Oriented Programming | Comprises the implementation of models and functions provided to users.                                                                                         |
  | [@ts-graphviz/adapter](https://www.npmjs.com/package/@ts-graphviz/adapter) | Graphviz Runtime adapters for Cross Platform    | Handles runtime-dependent processing, such as input/output processing and Renderer implementations for different environments.                                  |

  ![dependency-graph](https://user-images.githubusercontent.com/35218186/236679412-ccef1f5d-14e8-46d1-808d-28bfe810ffda.svg)

  ## Node.js Version Support Update

  Starting with the upcoming release, ts-graphviz will no longer support Node.js 14 & 16, which has reached its End-of-Life (EOL). The new minimum guaranteed version will be **Node.js 18**. This decision allows us to focus on providing a secure and up-to-date library while minimizing the maintenance burden of supporting outdated versions.

  To minimize disruption for our users, we have established a clear **Node.js Version Support Policy** for our library. This policy helps users understand our approach to Node.js version support and what to expect when using our library.

  We encourage our users to update their projects to the latest LTS version of Node.js to ensure the best performance, security, and compatibility with ts-graphviz.

  ### Node.js Version Support Policy

  Our goal is to provide a stable and secure library for our users while keeping up with improvements in the JavaScript ecosystem. To achieve this, we have established the following Node.js version support policy for ts-graphviz:

  1. **Minimum Guaranteed Version**: We guarantee support for the latest Node.js version that has entered Long-Term Support (LTS) at the time of a major release of our library. This ensures that our library benefits from the stability and long-term support provided by LTS versions.

  2. **End-of-Life (EOL) Policy**: We will cease support for Node.js versions when they reach their EOL, as defined by the Node.js release schedule. This helps us focus on providing a secure and up-to-date library while minimizing the maintenance burden of supporting outdated versions.

  3. **Version Support Communication**: We will communicate our Node.js version support policy in our library's documentation and release notes. When a new major version is released or when a Node.js version enters EOL, we will inform our users through release notes, blog posts, or other relevant channels.

  4. **Migration Guides** : When introducing breaking changes due to Node.js version support updates, we will provide migration guides to help our users transition their projects to the new requirements smoothly.

  ### Migration Guides

  #### Update Node.js Version

  To migrate to the new Node.js version support policy, follow these steps:

  1. **Check Node.js Version**: First, check the version of Node.js used in your project by running the following command in your terminal:
     ```sh
     node -v
     ```
  2. **Update Node.js**: If your project is using Node.js 14 or 16, update it to the latest LTS version of Node.js (Node.js 18) by following the installation instructions provided on the official Node.js website or using a version manager like nvm or n.
  3. **Update Dependencies**: After updating Node.js, review your project's dependencies to ensure that they are compatible with the new Node.js version. Update any dependencies that require changes to work with the latest LTS version of Node.js.
  4. **Test and Verify**: Test your project with the updated Node.js version to ensure that it works as expected. Verify that all functionality is intact and that there are no compatibility issues with the new Node.js version.

  By following these steps, you can migrate your project to the latest LTS version of Node.js and ensure compatibility with ts-graphviz.

  #### Migrate `AttributeKeyDict` type to `Attribute.keys` type

  `AttributeKeyDict` was deprecated in v1, so it was removed in v2.
  Please modify to use `Attribute.keys`.

  ```diff
  - import { AttributeKeyDict } from 'ts-graphviz';
  + import { Attribute } from '@ts-graphviz/common';

  - const foo: AttributeKeyDict = ...;
  + const foo: Attribute.keys = ...;
  ```

  #### Migrate `ts-graphviz/adapter` to `@ts-graphviz/adapter`

  To migrate from the `ts-graphviz/adapter` module to the `@ts-graphviz/adapter` module, follow these steps:

  1. **Update Import Statements**: Update import statements in your code to use the new module name.

     ```diff
     - import { } from 'ts-graphviz/adapter';
     + import { } from '@ts-graphviz/adapter';
     ```

  2. **Update Package.json**: Update the `ts-graphviz` dependency in your `package.json` file to use the new version of the `@ts-graphviz/adapter` module.

     ```diff
     - "ts-graphviz": "^1.0.0",
     + "ts-graphviz": "^2.0.0",
     + "@ts-graphviz/adapter": "^2.0.0",
     ```

  3. **Update Code References**: Search your codebase for any references to the `ts-graphviz/adapter` module and update them to use the new module name.

     ```diff
     - import { } from 'ts-graphviz/adapter';
     + import { } from '@ts-graphviz/adapter';
     ```

  #### Migrate `ts-graphviz/ast` to `@ts-graphviz/ast`

  To migrate from the `ts-graphviz/adapter` module to the `@ts-graphviz/adapter` module, follow these steps:

  1. **Update Import Statements**: Update import statements in your code to use the new module name.

     ```diff
     - import { } from 'ts-graphviz/ast';
     + import { } from '@ts-graphviz/ast';
     ```

  2. **Update Package.json**: Update the `ts-graphviz` dependency in your `package.json` file to use the new version of the `@ts-graphviz/ast` module.

     ```diff
     - "ts-graphviz": "^1.0.0",
     + "ts-graphviz": "^2.0.0",
     + "@ts-graphviz/ast": "^2.0.0",
     ```

  3. **Update Code References**: Search your codebase for any references to the `ts-graphviz/ast` module and update them to use the new module name.

     ```diff
     - import { } from 'ts-graphviz/ast';
     + import { } from '@ts-graphviz/ast';
     ```

  #### Migrate Extending the Type System

  Common types moves to `@ts-graphviz/common` in v2.0.0.

  If you have extended the type system, you need to update the import path.

  ##### Use Case: Specifying Custom Graph Layout and Output Formats

  ```diff
  -import { $keywords } from 'ts-graphviz';
  +import { $keywords } from '@ts-graphviz/common';
  -import { toFile } from 'ts-graphviz/adapter';
  +import { toFile } from '@ts-graphviz/adapter';

  -// 1. Declare the 'ts-graphviz/adapter' module.
  -declare module 'ts-graphviz/adapter' {
  +// 1. Declare the '@ts-graphviz/adapter' module.
  +declare module '@ts-graphviz/adapter' {
    export namespace Layout {
      // 2. Define the $values interface in the Layout namespace.
      // 3. Inherit from $keywords<'my-custom-algorithm'> and specify the name of the new layout engine in <...>.
      export interface $values extends $keywords<'my-custom-algorithm'> {}
    }

    export namespace Format {
      // 4. Define the $values interface in the Format namespace.
      // 5. Inherit from $keywords<'mp4'> and specify the name of the new output format in <...>.
      export interface $values extends $keywords<'mp4'> {}
    }
  }

  toFile('digraph { a -> b }', '/path/to/file', {
    layout: 'my-custom-algorithm',
    format: 'mp4',
  });
  ```

  ##### Use Case: Adding Custom Attributes

  ```diff
  - import { digraph, toDot, attribute as _, $keywords } from 'ts-graphviz';
  + import {  $keywords } from '@ts-graphviz'/common;
  + import { digraph, toDot, attribute as _ } from 'ts-graphviz';

  -// 1. Declare the 'ts-graphviz' module.
  -declare module 'ts-graphviz' {
  +// 1. Declare the '@ts-graphviz/common' module.
  +declare module '@ts-graphviz/common' {
    export namespace GraphAttributeKey {
      // 2. Define the $values interface in the GraphAttributeKey namespace.
      // 3. Inherit from $keywords<'hoge'> and specify the name of the new attribute in <...>.
      export interface $values extends $keywords<'hoge'> {}
    }

    export namespace Attribute {
      // 4. Define the $keys interface in the Attribute namespace.
      // 5. Inherit from $keywords<'hoge'> and specify the name of the new attribute in <...>.
      export interface $keys extends $keywords<'hoge'> {}

      // 6. Define the $types interface in the Attribute namespace.
      // 7. Specify the new attribute in the key and define its corresponding value in the value.
      export interface $types {
        hoge: string;
      }
    }
  }

  console.log(
    toDot(
      digraph((g) => {
        g.set(_.hoge, 'fuga');
      }),
    ),
  );
  ```

  ## Development

  ### Package manager

  Migration from yarn v1 to pnpm has been done for package management.

  ### Build tool and Test suite

  To enhance the development experience, the build tool has been changed from rollup to vite, and the test suite from jest to vitest. This was done because jest lacked standard support for monorepo integration and TypeScript, requiring the installation of additional plugins. However, vite and vitest handle these challenges more elegantly, providing a smoother and more efficient development workflow.

  ### Release flow

  The release flow has been updated to use the changeset tool to manage changes and releases.

  This tool allows for a more streamlined and automated release process, making it easier to manage versioning and changelogs across multiple packages within the monorepo.

  ### Linter an Formatter

  The linter and formatter have been updated to use biome, respectively.

  This change was made to ensure consistent code style and formatting across the entire codebase, making it easier to maintain and contribute to the project.

  ## API Changes

  - The status of the ModelContext API and other APIs that were provided in beta and alpha have been removed. This is a temporary measure to ensure compliance with the `@microsoft/api-extractor` specification used internally in the d.ts file rollup.

### Patch Changes

- [#966](https://github.com/ts-graphviz/ts-graphviz/pull/966) [`d579034`](https://github.com/ts-graphviz/ts-graphviz/commit/d579034d3b834eceafa4aa290c0e0d4fd74a5192) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump vite-plugin-dts from 3.7.2 to 3.7.3

- [#970](https://github.com/ts-graphviz/ts-graphviz/pull/970) [`54f4565`](https://github.com/ts-graphviz/ts-graphviz/commit/54f45653d89640a16b6baa1a005e963b349fd2cd) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump @types/node from 20.11.20 to 20.11.24

- Updated dependencies [[`d579034`](https://github.com/ts-graphviz/ts-graphviz/commit/d579034d3b834eceafa4aa290c0e0d4fd74a5192), [`54f4565`](https://github.com/ts-graphviz/ts-graphviz/commit/54f45653d89640a16b6baa1a005e963b349fd2cd), [`1e4f57a`](https://github.com/ts-graphviz/ts-graphviz/commit/1e4f57aee8a97fa79240c002ef4925b0fa6a0548)]:
  - @ts-graphviz/core@2.0.0
  - @ts-graphviz/common@2.0.0
  - @ts-graphviz/ast@2.0.0
  - @ts-graphviz/adapter@2.0.0
