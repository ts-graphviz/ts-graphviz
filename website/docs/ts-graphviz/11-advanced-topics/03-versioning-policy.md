---
description: Versioning policy for ts-graphviz.
---
# Versioning Policy

## Overview

**ts-graphviz** follows [**Semantic Versioning 2.0**](https://semver.org/) to ensure consistency and predictability. This policy clarifies how we manage breaking changes, especially those related to runtime support, and what users can expect when using **ts-graphviz**.

## Semantic Versioning

Version numbers are formatted as **MAJOR.MINOR.PATCH**, with changes classified as follows:

- **MAJOR**: Introduces backward-incompatible changes.
- **MINOR**: Adds functionality in a backward-compatible manner.
- **PATCH**: Fixes bugs in a backward-compatible manner.

---

## Exceptions: TypeScript Version Updates

There are scenarios where **ts-graphviz** may deviate from strict Semantic Versioning:

- **TypeScript Definitions**: Breaking changes to TypeScript type definitions may occur between minor versions due to:
  - TypeScript introducing breaking changes in its own minor updates.
  - Adopting features available only in newer TypeScript versions, which may raise the minimum required TypeScript version.

:::tip
For TypeScript projects, we recommend pinning the **ts-graphviz** minor version to control upgrade timing and compatibility testing.
:::

### Supported TypeScript versions {#supported-typescript-versions}

- **v4 requires TypeScript 5.0 or later.** A raise of this minimum is announced in the release notes of the minor release that makes it.
- CI type-checks the published packages, as installed from their tarballs, with the minimum (5.0), TypeScript 6 and TypeScript 7. Each is checked with `moduleResolution` `node16`, `nodenext` and `bundler` (including the adapter's `browser` and `deno` conditions), and with `strict`, `exactOptionalPropertyTypes` and `skipLibCheck: false`.
- The packages are ES modules only. `require()` from CommonJS type-checks with TypeScript 5.8 or later (`module: nodenext`) or 5.9 or later (`module: node20`).
- With TypeScript 5.0, use an `@types/node` that still supports it (the `ts5.0` dist-tag, `npm install -D @types/node@ts5.0`); the latest `@types/node` needs TypeScript 5.1 or later.

---

## Information Sharing

We are committed to transparent communication regarding our versioning and support policies:

- **Documentation and Release Notes**: All changes to the versioning policy and support levels will be documented in our official documentation and detailed in release notes.
- **Community Engagement**: Users are encouraged to subscribe to updates or follow our repositories to stay informed about the latest developments.

---

## Migration Support

To assist users in transitioning between versions, especially when breaking changes occur:

- **Migration Guides**: We provide comprehensive migration guides outlining steps to upgrade to new major versions.
- **Code Examples**: Examples are included to demonstrate how to adapt code to accommodate changes.
- **Support Channels**: Users can seek assistance through community forums, issue trackers, or other support channels if they encounter difficulties during migration.
