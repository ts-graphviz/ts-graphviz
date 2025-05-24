---
"ts-graphviz": minor
"@ts-graphviz/adapter": minor
"@ts-graphviz/common": minor
"@ts-graphviz/react": minor
"@ts-graphviz/core": minor
"@ts-graphviz/ast": minor
---

Define Supported environment and Support levels

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
