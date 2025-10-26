# @ts-graphviz/ast

## 3.0.5

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

- [#1533](https://github.com/ts-graphviz/ts-graphviz/pull/1533) [`ed770be`](https://github.com/ts-graphviz/ts-graphviz/commit/ed770be7fffc93b9171198c9a84270df7477185d) Thanks [@kamiazya](https://github.com/kamiazya)! - Add memory exhaustion protection with input size and AST node count limits

  Addresses security vulnerability where extremely large inputs or inputs with excessive elements could cause memory exhaustion, leading to application crashes and potential DoS attacks.

  ## Security Enhancements

  ### Input Size Limit

  - Added `maxInputSize` option to `parse()` function (default: 10MB)
  - Validates input size before parsing to prevent memory exhaustion from extremely large DOT files
  - Configurable limit allows flexibility for legitimate large graphs
  - Can be disabled by setting to 0 (not recommended for untrusted inputs)

  ### AST Node Count Limit

  - Added `maxASTNodes` option to `parse()` function (default: 100,000 nodes)
  - Tracks and limits the number of AST nodes created during parsing
  - Prevents memory exhaustion from inputs with excessive elements
  - Configurable limit for complex graphs when needed
  - Can be disabled by setting to 0 (not recommended for untrusted inputs)

  ## Changes

  ### API Updates

  - `CommonParseOptions` interface extended with `maxInputSize` and `maxASTNodes` options
  - `Builder` class enhanced with node counting and validation
  - `parse()` function validates input size before parsing
  - Parser grammar updated to pass limits to Builder

  ### Error Handling

  - Input size violations throw `DotSyntaxError` with descriptive messages
  - AST node count violations throw `DotSyntaxError` with actionable guidance
  - Error messages include current values and suggestions for resolution

  ### Testing

  - Comprehensive test coverage for both limits
  - Tests for normal usage, boundary conditions, and limit violations
  - Tests for custom limit values and disabling limits
  - All 62 parser tests passing

  ### Documentation

  - Updated `SECURITY.md` with detailed security protection information
  - Added usage examples and best practices
  - Documented recommendations for untrusted input handling

  ## Security Impact

  - Prevents DoS attacks via extremely large DOT files (hundreds of MB)
  - Prevents memory exhaustion from inputs with tens of thousands of elements
  - Default limits protect normal use cases while allowing customization
  - Complements existing protections (HTML nesting depth, edge chain depth)
  - Provides defense-in-depth security strategy

- [#1532](https://github.com/ts-graphviz/ts-graphviz/pull/1532) [`dc3ef34`](https://github.com/ts-graphviz/ts-graphviz/commit/dc3ef34316f5642c416711cb6a50704dbef7bb64) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump vite from 7.0.2 to 7.0.8 in the npm_and_yarn group across 1 directory

- [#1535](https://github.com/ts-graphviz/ts-graphviz/pull/1535) [`11f7126`](https://github.com/ts-graphviz/ts-graphviz/commit/11f7126347816f64f7892c8608b5e3bf1a826670) Thanks [@kamiazya](https://github.com/kamiazya)! - Fix comment injection vulnerability in block comments

  Addresses security vulnerability where malicious `*/` sequences in comment content could break out of block comment context and inject arbitrary DOT syntax.

  ## Security Enhancement

  ### Comment Content Escaping

  - Added `escapeComment()` utility function to sanitize comment content
  - Block comments: Breaks up `*/` sequences using zero-width space (U+200B) to prevent early comment termination
  - All comment types: Removes null bytes that could cause parsing issues
  - Follows C/C++ and DOT language specifications where block comments cannot be nested

  ## Changes

  ### New Utility Function

  - `escapeComment()` in `packages/ast/src/dot-shim/printer/plugins/utils/escape-comment.ts`
  - Prevents comment injection by inserting zero-width space between `*` and `/`
  - Maintains visual appearance while preventing syntax injection
  - Verified to work with Graphviz 13.1.1

  ### Updated Components

  - `CommentPrintPlugin` now applies escaping before outputting comment content
  - All comment values are sanitized at print time, not at creation time
  - Maintains backward compatibility with existing AST structures

  ### Testing

  - 11 unit tests for `escapeComment()` function covering:
    - Block comment injection prevention
    - Multiple `*/` sequence handling
    - Null byte removal
    - Normal content preservation
  - Integration tests in `stringify.test.ts` for end-to-end verification
  - All existing tests continue to pass

  ## Security Impact

  - Prevents DOT syntax injection via malicious comment content
  - Blocks attempts to escape comment context and inject arbitrary graph definitions
  - Protects against parser manipulation through crafted comment values
  - Zero-width space approach is standards-compliant and validated with official Graphviz parser

  ## Technical Details

  According to C/C++ and DOT language specifications, block comments (`/* */`) cannot be nested and there is no escape sequence for the closing delimiter within comments. The standard workaround is to insert a zero-width space (U+200B) between `*` and `/`, which:

  - Prevents early comment termination
  - Preserves visual appearance (zero-width character is invisible)
  - Is correctly handled by Graphviz parser (tested with version 13.1.1)
  - Follows industry best practices for comment sanitization

- Updated dependencies [[`dc3ef34`](https://github.com/ts-graphviz/ts-graphviz/commit/dc3ef34316f5642c416711cb6a50704dbef7bb64)]:
  - @ts-graphviz/common@3.0.4

## 3.0.4

### Patch Changes

- [#1531](https://github.com/ts-graphviz/ts-graphviz/pull/1531) [`c4a08b9`](https://github.com/ts-graphviz/ts-graphviz/commit/c4a08b9f6bbe9104a461d5dc599ca307f6940f7c) Thanks [@kamiazya](https://github.com/kamiazya)! - Fix stack overflow vulnerability in edge chain parser

  This patch addresses a security vulnerability where deeply chained edges in DOT files could cause stack overflow, leading to application crashes and potential DoS attacks.

  **Changes:**

  - Added depth limit (default: 1000) to edge chain parsing in PEG grammar
  - Introduced `maxEdgeChainDepth` option to `parse()` function for custom depth limits
  - Improved parser to track and limit edge chain depth during parsing
  - Reset edge chain depth counter after successful edge parse

  **Security Impact:**

  - Prevents stack overflow attacks from maliciously crafted DOT files with deep edge chains (e.g., `a -> b -> c -> ... -> z`)
  - Prevents memory exhaustion from unbounded `edgeops` array growth
  - Normal use cases (typically <100 edges per chain) are unaffected
  - Configurable limit allows complex graphs when needed

  **Breaking Changes:**
  None. This is a backward-compatible security fix with sensible defaults.

- [#1526](https://github.com/ts-graphviz/ts-graphviz/pull/1526) [`00aaf2f`](https://github.com/ts-graphviz/ts-graphviz/commit/00aaf2ff6ef6fa8b6611ec2a477bc46b76fdebaf) Thanks [@kamiazya](https://github.com/kamiazya)! - Fix critical stack overflow vulnerability in HTML string parser

  This patch addresses a critical security vulnerability where deeply nested HTML-like structures in DOT files could cause stack overflow, leading to application crashes and potential DoS attacks.

  **Changes:**

  - Added depth limit (default: 100) to HTML string parsing in PEG grammar
  - Introduced `maxHtmlNestingDepth` option to `parse()` function for custom depth limits
  - Improved parser to track and limit HTML nesting depth during parsing

  **Security Impact:**

  - Prevents stack overflow attacks from maliciously crafted DOT files with deep HTML nesting
  - Normal use cases (typically <10 levels) are unaffected
  - Configurable limit allows complex parsing when needed

  **Breaking Changes:**
  None. This is a backward-compatible security fix with sensible defaults.

- [#1530](https://github.com/ts-graphviz/ts-graphviz/pull/1530) [`52e3f1f`](https://github.com/ts-graphviz/ts-graphviz/commit/52e3f1ff58a77bf9bd9a0d0b6e29edb20e3700e5) Thanks [@kamiazya](https://github.com/kamiazya)! - Clarify security model: GraphViz HTML-like labels vs browser HTML

  Add documentation clarifying that HTML-like labels are part of the GraphViz DOT language specification and are not browser HTML. This helps prevent confusion about XSS risks, which occur when rendering GraphViz output in browsers, not when generating DOT strings.

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

- [#1458](https://github.com/ts-graphviz/ts-graphviz/pull/1458) [`9f72aed`](https://github.com/ts-graphviz/ts-graphviz/commit/9f72aededee9c45b32f2e8e7f4c16c561e04d60a) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump peggy from 5.0.3 to 5.0.6

- Updated dependencies [[`9d52d28`](https://github.com/ts-graphviz/ts-graphviz/commit/9d52d282031ed173a75ef0fb77ddea9677f78520), [`d74172a`](https://github.com/ts-graphviz/ts-graphviz/commit/d74172a594531f071b7e06c079b6555d867bf683), [`de566db`](https://github.com/ts-graphviz/ts-graphviz/commit/de566db993e1f62325f3a4afdbde178b86a96509)]:
  - @ts-graphviz/common@3.0.3

## 3.0.2

### Patch Changes

- [#1483](https://github.com/ts-graphviz/ts-graphviz/pull/1483) [`a07d3b7`](https://github.com/ts-graphviz/ts-graphviz/commit/a07d3b7037d08bcb99679562468e16e5af0968ba) Thanks [@kamiazya](https://github.com/kamiazya)! - Fix CI workflow to prevent @next tag publishing after Version Packages PR merge

- Updated dependencies [[`a07d3b7`](https://github.com/ts-graphviz/ts-graphviz/commit/a07d3b7037d08bcb99679562468e16e5af0968ba)]:
  - @ts-graphviz/common@3.0.2

## 3.0.1

### Patch Changes

- [#1479](https://github.com/ts-graphviz/ts-graphviz/pull/1479) [`c9653aa`](https://github.com/ts-graphviz/ts-graphviz/commit/c9653aa75cb13a91d6a6bcbd8b64161cfd0273b5) Thanks [@kamiazya](https://github.com/kamiazya)! - Fix TypeScript compilation error when skipLibCheck is false

  This fixes issue #1478 where importing from `ts-graphviz` would cause a TypeScript error:
  "Cannot find module './\_parse.js' or its corresponding type declarations."

  The issue was caused by the `Rule` type referencing `StartRuleNames` from the auto-generated
  `_parse.ts` file, which was not properly exported. The fix removes the dependency on the
  generated type and defines the `Rule` type directly in `parse.ts`.

  Changes:

  - Remove import of non-existent `StartRuleNames` type from `_parse.ts`
  - Fix import of `PeggySyntaxError` to use the correct export name
  - Define `Rule` type directly as a union of rule name string literals

- [#1480](https://github.com/ts-graphviz/ts-graphviz/pull/1480) [`ab5d0c7`](https://github.com/ts-graphviz/ts-graphviz/commit/ab5d0c75620a0fd1bf36373716b26c2d433a0bc6) Thanks [@kamiazya](https://github.com/kamiazya)! - Fix CI workflow to prevent publishing stable releases with @next tag

- Updated dependencies [[`ab5d0c7`](https://github.com/ts-graphviz/ts-graphviz/commit/ab5d0c75620a0fd1bf36373716b26c2d433a0bc6)]:
  - @ts-graphviz/common@3.0.1

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

- [#1363](https://github.com/ts-graphviz/ts-graphviz/pull/1363) [`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c) Thanks [@kamiazya](https://github.com/kamiazya)! - Adjust HTML label AST handling for consistent behavior #1335

  Improves the handling of HTML-like labels in the `fromDot` and `toDot` functions to ensure valid Dot output.

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

- Updated dependencies [[`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c), [`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c), [`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c), [`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c), [`9328563`](https://github.com/ts-graphviz/ts-graphviz/commit/932856396ed0dede1dfc6737344a628f9667d07c)]:
  - @ts-graphviz/common@3.0.0

## 2.0.7

### Patch Changes

- [#1318](https://github.com/ts-graphviz/ts-graphviz/pull/1318) [`c043ba9`](https://github.com/ts-graphviz/ts-graphviz/commit/c043ba9bcc5194a89b976df1609c4e9875300f1e) Thanks [@kamiazya](https://github.com/kamiazya)! - Improve error handling and documentation in the @ts-graphviz/ast package.

  The most important changes include fixing an unexpected parsing error, updating the error class used in the parse function, and enhancing the documentation for the `DotSyntaxError` class.

## 2.0.6

### Patch Changes

- [#1218](https://github.com/ts-graphviz/ts-graphviz/pull/1218) [`d7ff421`](https://github.com/ts-graphviz/ts-graphviz/commit/d7ff421ec861ca8fdede1a6bdf256f3455fb9797) Thanks [@kamiazya](https://github.com/kamiazya)! - Fix AST printing not to be destroyed during stringify even in HTML-Like format

- Updated dependencies [[`d7ff421`](https://github.com/ts-graphviz/ts-graphviz/commit/d7ff421ec861ca8fdede1a6bdf256f3455fb9797)]:
  - @ts-graphviz/common@2.1.5

## 2.0.5

### Patch Changes

- [#1204](https://github.com/ts-graphviz/ts-graphviz/pull/1204) [`03bafa0`](https://github.com/ts-graphviz/ts-graphviz/commit/03bafa0e10b43807b5568df4ffba720752a0ac02) Thanks [@kamiazya](https://github.com/kamiazya)! - Fix string escaping in DOT language

- [#1183](https://github.com/ts-graphviz/ts-graphviz/pull/1183) [`6bb5ab1`](https://github.com/ts-graphviz/ts-graphviz/commit/6bb5ab18682daa1410de4a35edc22316487989af) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump peggy from 4.0.2 to 4.0.3

- [#1179](https://github.com/ts-graphviz/ts-graphviz/pull/1179) [`f48ae4a`](https://github.com/ts-graphviz/ts-graphviz/commit/f48ae4a36fde430cf4a4769189243acd76560946) Thanks [@kamiazya](https://github.com/kamiazya)! - build(deps-dev): bump vite-plugin-dts from 3.9.1 to 4.2.1

- [#1213](https://github.com/ts-graphviz/ts-graphviz/pull/1213) [`b44aa66`](https://github.com/ts-graphviz/ts-graphviz/commit/b44aa66d46a0a5240384e70b986ce3e7d0a02218) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump vitest and @vitest/coverage-istanbul

- [#1214](https://github.com/ts-graphviz/ts-graphviz/pull/1214) [`b3a3323`](https://github.com/ts-graphviz/ts-graphviz/commit/b3a3323c70e72c87b7728684a5862b5d6e54fbb9) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump vite from 5.2.8 to 5.4.8

- Updated dependencies [[`f48ae4a`](https://github.com/ts-graphviz/ts-graphviz/commit/f48ae4a36fde430cf4a4769189243acd76560946), [`b44aa66`](https://github.com/ts-graphviz/ts-graphviz/commit/b44aa66d46a0a5240384e70b986ce3e7d0a02218), [`b3a3323`](https://github.com/ts-graphviz/ts-graphviz/commit/b3a3323c70e72c87b7728684a5862b5d6e54fbb9)]:
  - @ts-graphviz/common@2.1.4

## 2.0.4

### Patch Changes

- [#1088](https://github.com/ts-graphviz/ts-graphviz/pull/1088) [`7d7352b`](https://github.com/ts-graphviz/ts-graphviz/commit/7d7352bb3819522ba16763503aa6bc923f550408) Thanks [@kamiazya](https://github.com/kamiazya)! - Update Snapshot release configuration

- Updated dependencies [[`883f7b3`](https://github.com/ts-graphviz/ts-graphviz/commit/883f7b3c65794b3ab2b01c422b6231079bb6c28d), [`7d7352b`](https://github.com/ts-graphviz/ts-graphviz/commit/7d7352bb3819522ba16763503aa6bc923f550408)]:
  - @ts-graphviz/common@2.1.3

## 2.0.3

### Patch Changes

- [#1018](https://github.com/ts-graphviz/ts-graphviz/pull/1018) [`4b3c7d4`](https://github.com/ts-graphviz/ts-graphviz/commit/4b3c7d46e49a18ca05d6ecacbfa13d550039419f) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump lefthook from 1.6.7 to 1.6.10

- [#1022](https://github.com/ts-graphviz/ts-graphviz/pull/1022) [`70bbd56`](https://github.com/ts-graphviz/ts-graphviz/commit/70bbd5673da3b83c3655e5f0d23454af6a8dc1d1) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump @types/node from 20.11.24 to 20.12.7

- [#1023](https://github.com/ts-graphviz/ts-graphviz/pull/1023) [`fb6789b`](https://github.com/ts-graphviz/ts-graphviz/commit/fb6789b82ce3bc890fa93a59b7d3fb3dc6417b5e) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump typescript from 5.3.3 to 5.4.5

- [#1020](https://github.com/ts-graphviz/ts-graphviz/pull/1020) [`7035af8`](https://github.com/ts-graphviz/ts-graphviz/commit/7035af80c275f8e3dd7e94fa2bfd22de45a96d67) Thanks [@kamiazya](https://github.com/kamiazya)! - Support Node.js v22

- [#1025](https://github.com/ts-graphviz/ts-graphviz/pull/1025) [`54f6569`](https://github.com/ts-graphviz/ts-graphviz/commit/54f6569c58a91410da97177a6735a1e414467ddd) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump vitest and @vitest/coverage-istanbul

- Updated dependencies [[`4b3c7d4`](https://github.com/ts-graphviz/ts-graphviz/commit/4b3c7d46e49a18ca05d6ecacbfa13d550039419f), [`70bbd56`](https://github.com/ts-graphviz/ts-graphviz/commit/70bbd5673da3b83c3655e5f0d23454af6a8dc1d1), [`fb6789b`](https://github.com/ts-graphviz/ts-graphviz/commit/fb6789b82ce3bc890fa93a59b7d3fb3dc6417b5e), [`7035af8`](https://github.com/ts-graphviz/ts-graphviz/commit/7035af80c275f8e3dd7e94fa2bfd22de45a96d67), [`54f6569`](https://github.com/ts-graphviz/ts-graphviz/commit/54f6569c58a91410da97177a6735a1e414467ddd)]:
  - @ts-graphviz/common@2.1.2

## 2.0.2

### Patch Changes

- [#1003](https://github.com/ts-graphviz/ts-graphviz/pull/1003) [`24f4174`](https://github.com/ts-graphviz/ts-graphviz/commit/24f4174a76eaef50fc7d30ae3401c1b23b00789b) Thanks [@dependabot](https://github.com/apps/dependabot)! - build(deps-dev): bump vite from 5.1.3 to 5.2.8

- [#1004](https://github.com/ts-graphviz/ts-graphviz/pull/1004) [`fabb8c8`](https://github.com/ts-graphviz/ts-graphviz/commit/fabb8c8b9f3ded57d41d7d4f1d669084ab4e91c9) Thanks [@kamiazya](https://github.com/kamiazya)! - Fix documentation build failed

- Updated dependencies [[`24f4174`](https://github.com/ts-graphviz/ts-graphviz/commit/24f4174a76eaef50fc7d30ae3401c1b23b00789b), [`fabb8c8`](https://github.com/ts-graphviz/ts-graphviz/commit/fabb8c8b9f3ded57d41d7d4f1d669084ab4e91c9)]:
  - @ts-graphviz/common@2.1.1

## 2.0.1

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

- Updated dependencies [[`cb5517a`](https://github.com/ts-graphviz/ts-graphviz/commit/cb5517a0236ce33527d200df9770390f4eb40064), [`0589b4f`](https://github.com/ts-graphviz/ts-graphviz/commit/0589b4f8849290d2c4a39beceb9b633f059f2e3f), [`5ce6b59`](https://github.com/ts-graphviz/ts-graphviz/commit/5ce6b59fa395bc344de2bfb15061b158a9ea5586), [`122336b`](https://github.com/ts-graphviz/ts-graphviz/commit/122336bede1033f73a2a94c82d499fda238f6b2e), [`b5f36fa`](https://github.com/ts-graphviz/ts-graphviz/commit/b5f36faf9cf70dfc263130c4480dc21770475c5a), [`c55f2d0`](https://github.com/ts-graphviz/ts-graphviz/commit/c55f2d0dfa851d318cc16a36499c69c0a34f1588), [`81a50ff`](https://github.com/ts-graphviz/ts-graphviz/commit/81a50ff94b461f44256f2eea5b86af5eb26afd94), [`391e98e`](https://github.com/ts-graphviz/ts-graphviz/commit/391e98edf70bb43c1feb4a00f832fa9d96dd9d39), [`a16f047`](https://github.com/ts-graphviz/ts-graphviz/commit/a16f047dfdd5db73f3e25847cf3fb2f8075aaf11), [`a16f047`](https://github.com/ts-graphviz/ts-graphviz/commit/a16f047dfdd5db73f3e25847cf3fb2f8075aaf11)]:
  - @ts-graphviz/common@2.1.0

## 2.0.0

### Initial release

> It is part of the ts-graphviz library, which is split into modular packages to improve maintainability, flexibility, and ease of use.

This package contains the module for processing the DOT language at the **A**bstract **S**yntax **T**ree (AST) level for the ts-graphviz library.

## Features

- Parsing and generating DOT language ASTs
- Functions for manipulating and transforming ASTs
- Support for custom AST nodes and attributes

## Usage

Import the necessary functions and classes from the `@ts-graphviz/ast` package:

```ts
import { parse, stringify } from "@ts-graphviz/ast";
```

Use the imported items in your project to work with DOT language ASTs:

```ts
const dotString = "digraph G { A -> B; }";
const ast = parse(dotString);

const outputDotString = stringify(ast);
console.log("Output DOT string:", outputDotString);
```
