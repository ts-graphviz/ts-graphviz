---
description: Security policies for ts-graphviz.
---
# Security Policies

## Purpose and Importance

In today's software development landscape, **Open Source Software (OSS)** plays an indispensable role in building applications. According to the **Open Source Security Foundation (OpenSSF)**, **70% to 90%** of modern applications consist of OSS components[^1], and the complexity of their dependencies is increasing daily.

[^1]: Behlendorf, B. (2022, May 11). *Brian Behlendorf Testifies to Congress on Open Source Software Security* (original in English). The Linux Foundation. Retrieved from [https://www.linuxfoundation.org/blog/blog/lf/brian-behlendorf-testifies-open-source-software-security](https://www.linuxfoundation.org/blog/blog/lf/brian-behlendorf-testifies-open-source-software-security)

### The Impact and Responsibility of ts-graphviz

**ts-graphviz** is a widely used library with over 2 million downloads per month, impacting a broad range of applications. Even users who do not directly interact with ts-graphviz are affected through software that depends on it.

> ![Dependency](https://imgs.xkcd.com/comics/dependency.png)
>
> *An illustration of software dependencies (Source: [xkcd.com/2347](https://xkcd.com/2347/))*

This illustration highlights how modern software relies on numerous underlying components.

**Ensuring the security of ts-graphviz is crucial because vulnerabilities can cascade through dependencies, potentially affecting countless applications.**

## Commitment to Security

ts-graphviz is committed to more than just providing secure source code. We implement **comprehensive security measures** that consider the **entire software supply chain**. This dedication ensures that users can confidently adopt ts-graphviz, knowing it contributes to building secure and reliable applications.

## Software Supply Chain Security

Recognizing that modern applications are heavily dependent on open-source software, we implement practices that safeguard against vulnerabilities throughout the dependency chain.

The measures in place:

- **CodeQL Analysis**: [![CodeQL](https://github.com/ts-graphviz/ts-graphviz/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/ts-graphviz/ts-graphviz/actions/workflows/codeql-analysis.yml)
  - Scans JavaScript/TypeScript code for security vulnerabilities. This runs on pushes to main, pull requests, and weekly, with results uploaded to GitHub's code scanning dashboard.
- **Continuous Testing and Static Analysis in CI**: [![Main](https://github.com/ts-graphviz/ts-graphviz/actions/workflows/main.yaml/badge.svg)](https://github.com/ts-graphviz/ts-graphviz/actions/workflows/main.yaml)
  - Includes testing and static analysis in CI. This ensures that code is tested and issues are addressed before being merged into the main branch.
- **Provenance**: [![Provenance](https://img.shields.io/badge/npm_package-provenanced-green)](https://www.npmjs.com/package/ts-graphviz)
  - [npm provenance](https://docs.npmjs.com/generating-provenance-statements) is a feature that allows users to verify the integrity and authenticity of npm packages. It helps ensure that the package is trustworthy and has not been tampered with.
- **Reproducible Builds**: every pull request, and every push to `main` or `next`, builds and packs the packages twice, on separate runners, and fails if a tarball differs; see [Verifying a Release](#verifying-a-release) for how to rebuild a published version yourself.
- **OpenSSF Scorecard**: [![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/ts-graphviz/ts-graphviz/badge)](https://scorecard.dev/viewer/?uri=github.com/ts-graphviz/ts-graphviz)
  - Evaluates supply chain security. It checks branch protection, maintenance status, and other security practices. The Scorecard is a CLI tool that automatically checks and evaluates security risks and can be integrated with CI tools like GitHub Actions for continuous evaluation. It publishes results to the OpenSSF API and creates a security badge. The score is published as a report.
- **OpenSSF Best Practices Badge**: [![OpenSSF Best Practices](https://www.bestpractices.dev/projects/8396/badge)](https://www.bestpractices.dev/projects/8396)
  - The project aims to meet the criteria for this badge by answering security-related questions and following best practices. This helps make packages more secure.
- **Enterprise Support**: [![Tidelift](https://tidelift.com/badges/package/npm/ts-graphviz?style=flat)](https://tidelift.com/subscription/pkg/npm-ts-graphviz?utm_source=npm-ts-graphviz&utm_medium=readme)
  - Available as part of the Tidelift Subscription. The maintainers of ts-graphviz and thousands of other packages work with Tidelift to deliver commercial support and maintenance for the open-source dependencies you use to build your applications. Save time, reduce risk, and improve code health, while paying the maintainers of the exact dependencies you use. [Learn more](https://tidelift.com/subscription/pkg/npm-ts-graphviz?utm_source=npm-ts-graphviz&utm_medium=referral&utm_campaign=enterprise&utm_term=repo).

### Verifying a Release {#verifying-a-release}

The packages are built reproducibly: building the same commit twice gives tarballs with the same bytes. `pnpm pack` writes a fixed timestamp (1985-10-26), no owner and a fixed entry order into the tarball, the build writes neither dates, source maps nor absolute paths into the output, and CI checks on every change that two clean builds agree (`pnpm pack:check` runs the same check locally).

So a published version can be rebuilt from its git tag and compared with what npm serves. Each package is tagged `<name>@<version>` (for example `ts-graphviz@3.0.13`, `@ts-graphviz/ast@3.0.7`). The build needs Node.js of the version in `.node-version` and the pnpm version in `packageManager` of `package.json` at that tag (Corepack or `pnpm env` installs them), because the output comes from the bundler and declaration tools those versions pin.

```bash
mkdir npm local

# the release, as npm serves it
npm view ts-graphviz@3.0.13 dist.integrity dist.tarball
npm pack ts-graphviz@3.0.13 --pack-destination npm

# the same version, built from its tag
git clone https://github.com/ts-graphviz/ts-graphviz.git
cd ts-graphviz
git checkout ts-graphviz@3.0.13
pnpm install --frozen-lockfile
pnpm codegen
pnpm build
pnpm --filter ts-graphviz pack --pack-destination ../local

# compare
cd ..
sha256sum npm/*.tgz local/*.tgz
mkdir npm-x local-x
tar -xzf npm/*.tgz -C npm-x
tar -xzf local/*.tgz -C local-x
diff -r npm-x local-x
```

What to expect:

- The files under `package/lib`, the README, CHANGELOG and LICENSE are identical.
- `package/package.json` may differ, but only in form: pnpm replaces the `workspace:` ranges of the internal dependencies with versions when it packs and when it publishes, and the two do not always write the keys in the same order; a registry or a publish step may also add fields a local pack never has (`_id`, `gitHead`, `_integrity`, `_resolved`, `_npm*` and similar). Compare it with the keys sorted (`jq -S . npm-x/package/package.json > a; jq -S . local-x/package/package.json > b; diff a b`). Because of this one file the tarball checksums (`dist.integrity`, `dist.shasum`) need not match a local pack byte for byte; the files inside do. (Checked with `ts-graphviz@3.0.13`: everything identical except the order of two `dependencies` keys.)
- `npm audit signatures` checks the registry signature and the provenance attestation of each installed package, which ties the tarball to the GitHub Actions run and commit that published it. A rebuild confirms, independently of npm, that the published files are what that commit produces.

If a file under `lib/` differs, report it privately (see [SECURITY.md](https://github.com/ts-graphviz/ts-graphviz/blob/main/SECURITY.md)) with both tarballs' checksums, the tag, and the Node.js and pnpm versions used.

## Reporting Vulnerabilities

We encourage users and security researchers to report any vulnerabilities or security concerns. Prompt reporting allows us to address issues swiftly, maintaining the integrity and security of the library.

Report a vulnerability privately, as described in [SECURITY.md](https://github.com/ts-graphviz/ts-graphviz/blob/main/SECURITY.md). The [security model](/docs/ts-graphviz/advanced-topics/security-model) says what is in scope for a report.
