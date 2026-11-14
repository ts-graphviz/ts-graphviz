# Security Policy

This file says how to report a vulnerability in ts-graphviz and what happens after a report. What the library guarantees, and the measures in place, are described on the website (see [Security Measures](#security-measures)).

## Reporting a Vulnerability

To report a security vulnerability, please use the
[GitHub Security Advisories report](https://github.com/ts-graphviz/ts-graphviz/security/advisories/new).

Please **DO NOT** file a public issue to report a security vulnerability.

The OpenSSF guidelines for security researchers describe how to coordinate a disclosure with an open source project:

- [Guidance for Security Researchers to Coordinate Vulnerability Disclosures with Open Source Software Projects](https://github.com/ossf/oss-vulnerability-guide/blob/main/finder-guide.md#readme)

## What to Report

The [security model](https://ts-graphviz.github.io/docs/ts-graphviz/advanced-topics/security-model/) states the trust boundaries of the library, what is guaranteed at each one and what is deliberately not promised. It is the reference for deciding whether a report is a vulnerability, and lists [what is in scope for a security report](https://ts-graphviz.github.io/docs/ts-graphviz/advanced-topics/security-model/#what-is-in-scope-for-a-security-report). Please read it before reporting.

## Supported Versions

See [Supported Major Versions](https://ts-graphviz.github.io/docs/ts-graphviz/advanced-topics/versioning-policy/#supported-major-versions) in the versioning policy.

## After a Report

1. The report stays private in its GitHub Security Advisory. We confirm the issue and assess it against the security model, and may ask you for details there.
2. The fix is prepared without disclosing the issue, and released in the supported versions.
3. The advisory is published when the fixed version is released. A CVE is requested for an issue with security impact.

Published advisories are listed in [GitHub Security Advisories](https://github.com/ts-graphviz/ts-graphviz/security/advisories).

## Security Measures

- [Security Policies](https://ts-graphviz.github.io/docs/ts-graphviz/advanced-topics/security-policies/): the measures in place for the code and the supply chain, and how to verify that a published release was built from this repository.
- [Security model](https://ts-graphviz.github.io/docs/ts-graphviz/advanced-topics/security-model/): the guarantees at each trust boundary, including the parser's limits, and what remains the responsibility of the application.
