# How To Contribute

## Developer Guide

This guide provides comprehensive information for developers who want to contribute to or extend the ts-graphviz codebase. It covers development environment setup, monorepo structure, build system, testing, and the contribution workflow.

### Setting Up the Development Environment

#### Prerequisites

Before you begin contributing to ts-graphviz, ensure you have the following installed:

- **Node.js**: Required for running the tests and building the project.
- **Deno**: Required for cross-platform testing.
- **pnpm**: A fast, disk space-efficient package manager.
- **Graphviz**: Required for rendering DOT files and generating visualizations.

#### Initial Setup

1. Start by forking the <https://github.com/ts-graphviz/ts-graphviz/fork>.
2. Clone your fork locally.
3. Install dependencies by running `pnpm install` in the root directory of the cloned repository.

#### Build System

The ts-graphviz project uses a monorepo structure managed by `pnpm`.
The build system is configured to handle multiple packages within the monorepo, allowing for efficient development and testing.

The project uses a modern TypeScript build pipeline managed by Vite:

#### Build Commands

| Command | Description |
|---------|-------------|
| `pnpm codegen` | Generate code from the Graphviz DOT language grammar. |
| `pnpm build` | Build all packages in the monorepo. |
| `pnpm test` | Run all tests across the monorepo. |
| `pnpm lint` | Run linting checks on the codebase. |
| `pnpm changeset` | Create a changeset for version management. |

> [!WARNING]
> Ensure you have to run `pnpm codegen` before developing. This step is crucial as it generates the necessary code from the Graphviz DOT language grammar.

#### Creating a Changeset

To create a changeset, use the `pnpm changeset` command. This will prompt you to enter details about the changes you made, which will be used for versioning and release notes.

This will prompt you to:

1. Select which packages are affected.
2. Choose the type of version bump (patch, minor, major).
3. Provide a description of your changes.


### Pull Request Process

When submitting a PR, you'll need to:

1. Fill out the PR template.
2. Ensure tests pass.
3. Maintain coding style.
4. Explain what problem your PR solves.

### Testing and Quality Assurance

#### Running Tests

To run tests for all packages:

```bash
$ pnpm test [optional: filter glob]
```

