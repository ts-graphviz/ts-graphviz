# SECURITY

**ts-graphviz** is committed to providing not just secure source code but implementing comprehensive security measures that consider the entire software supply chain.
This dedication ensures that users can confidently adopt ts-graphviz, knowing it contributes to building secure and reliable applications

## Reporting a Vulnerability

We encourage users and security researchers to report any vulnerabilities or security concerns. Prompt reporting allows us to address issues swiftly, maintaining the integrity and security of the library.
Please refer to the guidelines for security researchers to coordinate vulnerability disclosures with open source software projects from OpenSSF for best practices on how to report.

- [Guidance for Security Researchers to Coordinate Vulnerability Disclosures with Open Source Software Projects](https://github.com/ossf/oss-vulnerability-guide/blob/main/finder-guide.md#readme)

### How to Report a Vulnerability

To report a security vulnerability, please use the
[GitHub security Advisories report](https://github.com/ts-graphviz/ts-graphviz/security/advisories/new).

Please **DO NOT** file a public issue to report a security vulnerability.

## Supported Versions

Latest major version is supported.
If you are using an older version, please upgrade to the latest version.

## Security Updates

Security updates will be released as needed.

- If you are using an older version, please upgrade to the latest version.
- If you are using the latest version, please check the [GitHub security Advisories](https://github.com/ts-graphviz/ts-graphviz/security/advisories) for any security advisories.

## Security Measures Implemented

Security is maintained through several automated workflows within the CI/CD pipeline.
We continuously advance our security measures.

**Specific measures include:**

- **CodeQL Analysis**: [![CodeQL](https://github.com/ts-graphviz/ts-graphviz/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/ts-graphviz/ts-graphviz/actions/workflows/codeql-analysis.yml)
  - Scans JavaScript/TypeScript code for security vulnerabilities. This runs on pushes to main, pull requests, and weekly, with results uploaded to GitHub's code scanning dashboard.
- **Continuous Testing and Static Analysis in CI**: [![Main](https://github.com/ts-graphviz/ts-graphviz/actions/workflows/main.yaml/badge.svg)](https://github.com/ts-graphviz/ts-graphviz/actions/workflows/main.yaml)
  - Measures include testing and static analysis in CI. This ensures that the code is tested and other issues before it is merged into the main branch.
- **Provenance**: [![Provenance](https://img.shields.io/badge/npm_package-provenanced-grean)](https://www.npmjs.com/package/ts-graphviz)
  - [npm provenance](https://docs.npmjs.com/generating-provenance-statements) is a feature that allows users to verify the integrity and authenticity of npm packages. It helps ensure that the package is trustworthy and has not been tampered with.
- **OpenSSF Scorecard**: [![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/ts-graphviz/ts-graphviz/badge)](https://scorecard.dev/viewer/?uri=github.com/ts-graphviz/ts-graphviz)
  - Evaluates supply chain security. It checks branch protection, maintenance status, and other security practices. The Scorecard is a CLI tool that automatically checks and evaluates security risks and can be integrated with CI tools like GitHub Actions for continuous evaluation. It publishes results to OpenSSF API and creates a security badge, and the score is published as a report.
- **OpenSSF Best Practices Badge**: [![OpenSSF Best Practices](https://www.bestpractices.dev/projects/8396/badge)](https://www.bestpractices.dev/projects/8396)
  - The project aims to meet the criteria for this badge by answering security-related questions and following best practices. This helps make packages more secure.
- **Enterprise Support**: [![Tidelift](https://tidelift.com/badges/package/npm/ts-graphviz?style=flat)](https://tidelift.com/subscription/pkg/npm-ts-graphviz?utm_source=npm-ts-graphviz&utm_medium=readme)
  - Available as part of the Tidelift Subscription. The maintainers of ts-graphviz and thousands of other packages are working with Tidelift to deliver commercial support and maintenance for the open-source dependencies you use to build your applications. Save time, reduce risk, and improve code health, while paying the maintainers of the exact dependencies you use. [Learn more](https://tidelift.com/subscription/pkg/npm-ts-graphviz?utm_source=npm-ts-graphviz&utm_medium=referral&utm_campaign=enterprise&utm_term=repo).

