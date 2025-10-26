# SECURITY

**ts-graphviz** is committed to providing not only secure source code but also comprehensive security measures that cover the entire software supply chain. This commitment ensures that users can confidently adopt ts-graphviz, knowing it helps build secure and reliable applications.

## Reporting a Vulnerability

We encourage users and security researchers to report any vulnerabilities or security concerns. Prompt reporting allows us to address issues swiftly and maintain the integrity and security of the library.
Please refer to the OpenSSF guidelines for security researchers on how to coordinate vulnerability disclosures with open source software projects:

- [Guidance for Security Researchers to Coordinate Vulnerability Disclosures with Open Source Software Projects](https://github.com/ossf/oss-vulnerability-guide/blob/main/finder-guide.md#readme)

### How to Report a Vulnerability

To report a security vulnerability, please use the
[GitHub Security Advisories report](https://github.com/ts-graphviz/ts-graphviz/security/advisories/new).

Please **DO NOT** file a public issue to report a security vulnerability.

## Supported Versions

The latest major version is supported. If you are using an older version, please upgrade to the latest version.

## Security Updates

Security updates will be released as needed.

- If you are using an older version, please upgrade to the latest version.
- If you are using the latest version, please check the [GitHub Security Advisories](https://github.com/ts-graphviz/ts-graphviz/security/advisories) for any security advisories.

## Security Measures Implemented

Security is maintained through several automated workflows within the CI/CD pipeline. We continuously improve our security measures.

### Known Security Protections

#### DOT Parser Security (@ts-graphviz/ast)

The DOT parser includes multiple layers of protection against denial-of-service attacks:

- **HTML Nesting Depth Limit**: Protection against stack overflow attacks from deeply nested HTML-like structures. A configurable depth limit (default: 100 levels) prevents malicious DOT files from causing application crashes.

- **Edge Chain Depth Limit**: Protection against stack overflow from deeply chained edge structures. A configurable depth limit (default: 1000 edges) prevents malicious edge chains from exhausting stack space.

- **Input Size Limit**: Protection against memory exhaustion from extremely large inputs. A configurable size limit (default: 10MB) prevents processing of unreasonably large DOT files that could exhaust available memory.

- **AST Node Count Limit**: Protection against memory exhaustion from inputs with excessive elements. A configurable node limit (default: 100,000 nodes) prevents creation of massive ASTs that could consume all available memory.

All limits are configurable and can be adjusted or disabled based on your security requirements and use case. For more details, see the [@ts-graphviz/ast documentation](./packages/ast/README.md#parser-options).

**Important**: When processing untrusted inputs (e.g., user-uploaded DOT files in a web application), it is strongly recommended to keep these limits enabled with conservative values appropriate for your environment.

#### React Rendering Security (@ts-graphviz/react)

The `renderHTMLLike` function provides security protections against stack overflow attacks:

- **Recursion Depth Limit**: Protection against stack overflow from deeply nested React element structures. A configurable depth limit (default: 1000 levels) prevents crashes from deeply nested or circular structures.

- **Circular Reference Detection**: Prevents infinite loops from circular references in React element trees using stack-based tracking.

For more details and usage examples, see the [@ts-graphviz/react documentation](./packages/react/README.md#security-options).

#### Graphviz Adapter Security (@ts-graphviz/adapter)

When using the adapter to execute Graphviz commands:

- **Command Injection Protection**: The library uses `spawn` (Node.js) or `Deno.Command` (Deno) which do not invoke shell interpreters, preventing shell injection attacks.

- **Configuration Security**: The `dotCommand` and `library` options should be hardcoded by application developers, not derived from end-user input.

- **User-Provided DOT Files**: When processing DOT files from untrusted sources, implement validation to check for potentially dangerous attributes that reference file system resources (e.g., `image`, `shapefile`, `fontpath`).

For detailed security guidelines and validation examples, see the [@ts-graphviz/adapter documentation](./packages/adapter/README.md#security-considerations).

**Specific measures include:**

- **CodeQL Analysis**: [![CodeQL](https://github.com/ts-graphviz/ts-graphviz/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/ts-graphviz/ts-graphviz/actions/workflows/codeql-analysis.yml)
  - Scans JavaScript/TypeScript code for security vulnerabilities. This runs on pushes to main, pull requests, and weekly, with results uploaded to GitHub's code scanning dashboard.
- **Continuous Testing and Static Analysis in CI**: [![Main](https://github.com/ts-graphviz/ts-graphviz/actions/workflows/main.yaml/badge.svg)](https://github.com/ts-graphviz/ts-graphviz/actions/workflows/main.yaml)
  - Includes testing and static analysis in CI. This ensures that code is tested and issues are addressed before being merged into the main branch.
- **Provenance**: [![Provenance](https://img.shields.io/badge/npm_package-provenanced-green)](https://www.npmjs.com/package/ts-graphviz)
  - [npm provenance](https://docs.npmjs.com/generating-provenance-statements) is a feature that allows users to verify the integrity and authenticity of npm packages. It helps ensure that the package is trustworthy and has not been tampered with.
- **OpenSSF Scorecard**: [![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/ts-graphviz/ts-graphviz/badge)](https://scorecard.dev/viewer/?uri=github.com/ts-graphviz/ts-graphviz)
  - Evaluates supply chain security. It checks branch protection, maintenance status, and other security practices. The Scorecard is a CLI tool that automatically checks and evaluates security risks and can be integrated with CI tools like GitHub Actions for continuous evaluation. It publishes results to the OpenSSF API and creates a security badge. The score is published as a report.
- **OpenSSF Best Practices Badge**: [![OpenSSF Best Practices](https://www.bestpractices.dev/projects/8396/badge)](https://www.bestpractices.dev/projects/8396)
  - The project aims to meet the criteria for this badge by answering security-related questions and following best practices. This helps make packages more secure.
- **Enterprise Support**: [![Tidelift](https://tidelift.com/badges/package/npm/ts-graphviz?style=flat)](https://tidelift.com/subscription/pkg/npm-ts-graphviz?utm_source=npm-ts-graphviz&utm_medium=readme)
  - Available as part of the Tidelift Subscription. The maintainers of ts-graphviz and thousands of other packages work with Tidelift to deliver commercial support and maintenance for the open-source dependencies you use to build your applications. Save time, reduce risk, and improve code health, while paying the maintainers of the exact dependencies you use. [Learn more](https://tidelift.com/subscription/pkg/npm-ts-graphviz?utm_source=npm-ts-graphviz&utm_medium=referral&utm_campaign=enterprise&utm_term=repo).

