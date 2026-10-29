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
| `pnpm codegen` | Generate code: the DOT parser from the grammar, and the attribute types from the Graphviz documentation snapshot. |
| `pnpm --filter @ts-graphviz/common fetch:graphviz-docs` | Update the Graphviz documentation snapshot (`packages/common/graphviz-docs/`) that the attribute types are generated from. Pass `--ref <sha>` to pin a different commit of [graphviz.gitlab.io](https://gitlab.com/graphviz/graphviz.gitlab.io). |
| `pnpm build` | Build all packages in the monorepo. |
| `pnpm test` | Run the tests across the monorepo, except those tagged `process` (see [Tests that start processes](#tests-that-start-processes)). |
| `pnpm test:sandbox` | Run the tests tagged `process` in a container (Docker or Podman). |
| `pnpm lint` | Run linting checks on the codebase. |
| `pnpm knip` | Report unused files, exports and dependencies. |
| `pnpm check:packages` | Pack every package as `pnpm publish` would and run publint and arethetypeswrong on the tarballs (run `pnpm build` first). |
| `pnpm changeset` | Create a changeset for version management. |

> [!WARNING]
> Ensure you have to run `pnpm codegen` before developing. This step is crucial as it generates the necessary code from the Graphviz DOT language grammar.
>
> `packages/common/src/attributes/attribute.ts` is generated too, but it is committed; edit `packages/common/scripts/generate-attributes.ts` (or update the snapshot) and run `pnpm codegen` instead of editing it by hand. CI fails if the committed file is out of date.

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

#### Tests that start processes

Some tests start real processes: Graphviz (`dot`, `gvpr`) for the
differential and rendering tests, stand-in `dotCommand` scripts for the
adapter, and Biome. They carry the Vitest tag `process`, on the `describe`
or `it` that starts the process:

```ts
describe('renders with dot', { tags: ['process'] }, () => {
  // …
});
```

`pnpm test` leaves them out (`--tags-filter=!process`) and says so at the end.
`pnpm test:sandbox [vitest arguments]` runs them in a container started with
`podman run` or `docker run` (Podman when it works, else Docker;
`CONTAINER_RUNTIME=docker` or `podman` picks one). The image
(`test/sandbox/Dockerfile`) is Node.js of the same major version as yours
plus Graphviz, and the container has:

- no network (`--network none`);
- the repository, with the `node_modules` installed on your machine, mounted
  read-only, a read-only root file system and a `/tmp` tmpfs as the only
  writable place; `.git` and every top-level entry git does not track
  (`.env`, notes, caches), except `node_modules`, hidden behind an empty
  mount, since what the tests can read they can print;
- your uid/gid, no capabilities, `no-new-privileges`, and limits on
  processes and memory;
- an empty environment except `PATH`, `HOME=/tmp`, `TMPDIR`, `LANG`, and
  `CI`, `TZ`, `FC_NUM_RUNS` and `FC_SEED` when you set them, and
  `FORCE_COLOR=1` when the output is a terminal;
- an init process that reaps leftover child processes, removed afterwards;
- a time limit (`SANDBOX_TIMEOUT_MINUTES`, 30 by default), after which the
  container is removed.

It refuses to run if `dot` is missing from the image, so that the tests that
need Graphviz cannot skip.

It needs a Linux host (the mounted `node_modules` must be for Linux) with
Docker or Podman; without either it fails with a message, and `pnpm test`
still runs everything else. It runs `pnpm codegen` first if the parser has
not been generated.

`test/process-tag.test.ts` fails when a test file starts a process
(`node:child_process`, `Deno.Command`, a `dotCommand:` option, or the
adapter's `toStream`/`toFile`) without the tag, unless it mocks what it would
start; `test/process-guard.ts` makes `node:child_process` throw in a test that
is not tagged `process`, and outside tests (start processes in a test or in
`beforeEach`/`afterEach`, not while the file loads or in `beforeAll`/`afterAll`). Give every process test a timeout or an
`AbortSignal` (the tag sets a 120 s default), pass paths to stand-in scripts
through arguments or the environment rather than shell text, and kill the
background children a stand-in leaves. Both checks catch mistakes; they are
not a sandbox. Test files may not use worker threads, native bindings
(`process.binding`) or `ChildProcess` directly, which would get past the
guard.

In CI, the Linux jobs run `pnpm test` and then `pnpm test:sandbox`. The E2E
jobs (Windows, macOS, Linux, Deno) cannot use the container; they run
through `node scripts/clean-env.ts`, which passes only an allowlisted
environment and points `TMPDIR`/`TEMP`/`TMP` at a fresh directory.

