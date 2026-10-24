---
description: |-
  The security model of ts-graphviz: trust boundaries, the guarantees at each one, what is not promised, and the tests that enforce each guarantee.
---
# Security model

This document states what ts-graphviz trusts, what it guarantees at each boundary, what it does not promise, and which tests enforce each guarantee. It is the reference for deciding whether a report is a vulnerability (see [SECURITY.md](https://github.com/ts-graphviz/ts-graphviz/blob/main/SECURITY.md) for how to report one). The format follows the OpenSSF Best Practices "security assurance case": trust boundaries, guarantees, secure-design decisions and their evidence.

## Summary

Each boundary below has an identifier (`SM-1` … `SM-6`). Where a guarantee is enforced by tests, the tests carry the identifier in their title (for example `describe('[SM-2] …')`), and `test/security-model.test.ts` fails if an identifier claimed here has no test or a test names an identifier that is not here. The document therefore does not list test files; search the repository for the identifier.

ts-graphviz converts between three representations of a Graphviz graph: DOT text, an AST, and object models. The library itself performs no I/O: it does not touch the network or the file system and runs no code from its input. The only package that leaves the process is `@ts-graphviz/adapter`, which spawns the Graphviz `dot` executable.

| Boundary | Trusted? | Guarantee |
| --- | --- | --- |
| DOT text given to `parse` / `fromDot` | **untrusted** | terminates, bounded memory and stack, fails only with a typed, coded error |
| strings placed in models and written by `toDot` / `fromModel` | **untrusted** (as data) | written as literal text: cannot terminate the string, add statements or change the graph structure |
| `escString()` / `htmlLike()` values | **trusted** (caller opts in) | escape sequences / markup kept; only sanitised so they cannot end the string or label early (NUL rejected) |
| model classes, plugins, `ModelsContext`, `dotCommand` and other options | **trusted code and configuration** | none; misuse by the application is not a library vulnerability |
| `@ts-graphviz/adapter` | spawns `dot` with argv, no shell | no shell injection; the DOT it renders is still interpreted by Graphviz |
| the npm packages themselves | supply chain | SHA-pinned actions, provenance, scorecard, dependency cooldown |

## SM-1. DOT text → `parse` / `fromDot` (untrusted input)

The parser is the component most exposed to attacker-controlled data: a web service that renders user-uploaded DOT files passes them straight to it.

**Guarantees**

- **Termination and bounded resources.** The grammar is a PEG parser with these limits, all configurable through `ParseOptions`:

  | Limit | Option | Default |
  | --- | --- | --- |
  | input size | `maxInputSize` | 10 MiB |
  | HTML-like label nesting | `maxHtmlNestingDepth` | 100 |
  | edge chain length (`a -> b -> c …`) | `maxEdgeChainDepth` | 1000 |
  | AST node count | `maxASTNodes` | 100 000 |

  The input size is checked (on the UTF-8 encoding) before parsing starts; the other limits stop the parse as soon as they are crossed, so no structure larger than the limit is built. `maxInputSize` and `maxASTNodes` can be disabled with `0`; do not do that for untrusted input. The two depth limits cannot be disabled.
- **Typed, coded errors only.** For any string, `parse` either returns or throws `DotSyntaxError` (a `SyntaxError`, code `TSG_ERR_DOT_SYNTAX`) or another error carrying a `code` from `ERROR_CODES` (`isTsGraphvizError(e)` is true), so a caller can catch and classify every failure. (Passing a non-string is a type error on the caller's side.)
- **No code execution, no I/O.** Parsing produces plain objects. Attribute values are stored as text; nothing in the input is evaluated, resolved or fetched.
- **Faithful text.** A quoted string keeps its raw characters (including raw newlines and Graphviz escape sequences), and an HTML-like label is kept as markup. The parser does not interpret or sanitise them (see boundary 3 for what that means for consumers).

**Not promised**

- Semantic validity for Graphviz: the parser accepts the DOT grammar; whether Graphviz will render the result, or how long it takes, is outside the library.
- Protection against Graphviz-side issues in the file (e.g. an `image` attribute pointing at a local path) when the output is later rendered; see section 4.

**Evidence**: tests tagged `SM-1` — properties that arbitrary input either parses or throws a typed error and that whatever parses prints and parses again; the limit tests for input size, nesting depth, edge-chain depth and node count (including that the node count is per parse).

## SM-2. Application data → models → `toDot` (no DOT injection)

Applications build graphs from their own data: node ids from database keys, labels from user names. That data flows into DOT text, which Graphviz, other tools, or another ts-graphviz instance will parse.

**Guarantees**

- **A plain string is literal text.** Any `string` used as an id, port, attribute key or attribute value is escaped completely when written, so it cannot terminate the quoted string, add statements, or be read as an HTML-like label. `fromDot(toDot(g))` gives the same string back.
- **Values that must not be written are rejected.** A null character (`RangeError`, code `TSG_ERR_NUL_CHARACTER`) cannot be represented in DOT and is refused instead of dropped.
- **Booleans are written bare as `true`/`false`; numbers are written bare only in DOT's own numeral form.** Anything JavaScript could print differently (`1e21`, `NaN`, `Infinity`) is written as a quoted string.
- **Edge-target shorthand is the one place a string is parsed.** `g.edge(['a:p:n', 'b'])` splits the string on `:` into id, port and compass (as in DOT). An id that itself contains `:` must be given as `{ id: 'a:b' }`; then it is literal text like any other id.
- **Keys cannot smuggle syntax.** Attribute keys that are DOT keywords or not plain identifiers are quoted; a `__proto__` key from parsed input lands on a null-prototype record and does not change the object's prototype.

**Not promised**

- The meaning Graphviz gives to a value. A plain string `\N` is written so that Graphviz shows the two characters `\N`; an application that wants the node-name substitution uses `escString('\\N')` on purpose (section 3). What text is appropriate to show is the application's decision.

**Evidence**: tests tagged `SM-2` — properties that any string survives `toDot → fromDot` unchanged, that printing is idempotent, that numbers and keys round-trip, the unit tests of the escaping rules and the NUL rejection, and the differential test that feeds generated graphs to the Graphviz binaries and checks that `dot` accepts them and that the graph Graphviz builds (dumped with `gvpr`) is the one the model means.

## SM-3. `escString()` and `htmlLike()` (caller opts out of escaping)

Two value kinds deliberately bypass the literal-text rule because their content *is* DOT syntax:

- `escString(text)` keeps Graphviz escape sequences (`\N`, `\G`, `\l`, …) meaningful. When written, the text is sanitised just enough that it cannot end the string early: `"` is escaped, a raw line break becomes `\n`/`\r`, a backslash run that would escape the closing quote is completed, and NUL is rejected. Everything else is written as is.
- `htmlLike(markup)` writes an HTML-like label `<…>` verbatim.

**Guarantees**

- An `escString` value cannot terminate the quoted string or add statements.
- An `htmlLike` value must have balanced `<`/`>` and no NUL; otherwise Graphviz would end the label early and read the rest as DOT. `htmlLike()` rejects such markup when the value is created (`RangeError`, code `TSG_ERR_INVALID_HTML_LIKE`); a structurally equal value built by hand is checked again when written (`TSG_ERR_INVALID_HTML_LIKE`, or `TSG_ERR_NUL_CHARACTER` for a NUL).

**Not promised**

- **The content of an HTML-like label is not sanitised.** Graphviz interprets it (tables, fonts, `IMG SRC`, `HREF`). Passing untrusted text through `htmlLike()` is the application's responsibility; use a plain string (escaped as text) unless the markup is yours. The React package builds HTML-like labels from JSX, so text nodes in JSX are escaped, but attributes such as `href` and `src` are passed through.

**Evidence**: tests tagged `SM-3` — properties that escString values print idempotently and never break out of the string and that htmlLike values round-trip exactly or are rejected; the unit tests of the sanitising and validation rules and of the React HTML-like renderer.

## SM-4. `@ts-graphviz/adapter` (running Graphviz)

`toStream` / `toFile` spawn the Graphviz executable. This is the one place where ts-graphviz has side effects and where the *rendered* DOT matters.

**Guarantees**

- **No shell.** The command is started with `child_process.spawn` (Node.js) or `Deno.Command` with an argument array; nothing is interpolated into a shell string, so option values and DOT text cannot inject commands.
- **Typed failures.** A command that cannot start, cannot be written to, or exits non-zero rejects with `CommandExecutionError` (code `TSG_ERR_COMMAND_FAILED`, with `command`, the underlying `cause`, and `exit.code` / `exit.signal` / `exit.stderr` when the process did start); in a browser the functions throw `TSG_ERR_UNSUPPORTED_ENVIRONMENT`.
- **Web streams on every runtime**, so the output is consumed the same way on Node.js and Deno.
- **Bounded output.** The output kept in memory is limited by `maxOutputSize` (default 128 MiB; the command is killed and the call rejects with a `RangeError`, code `TSG_ERR_OUTPUT_LIMIT_EXCEEDED`); the command's stderr is kept to its last 64 KiB.
- **Stoppable.** With `signal`, the command is killed when the signal aborts and the call rejects with `signal.reason`; `AbortSignal.timeout(ms)` gives a time limit.
- **Files are replaced, not patched.** `toFile` writes only after the command succeeded and truncates an existing file.

**Not promised, and what the application must do**

- `dotCommand`, `library` and the other options are configuration: never derive them from end-user input.
- **Graphviz reads local files named in the DOT and can copy them into its output.** Verified with Graphviz 2.43: an EPS file named by `shapefile` (with `shape=epsf`) or by `image` is embedded in `-Tps` output; `image` and HTML-like `<IMG SRC>` embed images in raster output and reveal paths and sizes in SVG. `stylesheet` and URL attributes (`URL`, `href`, …, and `HREF` in HTML-like labels) are written into SVG, so a `javascript:` URL becomes script when the SVG is served inline. Graphviz has no sandbox (the old `GV_FILE_PATH` restriction was removed in Graphviz 6). ts-graphviz passes DOT through unchanged: when the DOT comes from an untrusted source, remove those attributes before rendering (a supported way to do this is tracked in #1681), run Graphviz as an unprivileged user in an isolated file system, and set `signal` and `maxOutputSize`.
- Without `signal`, layout time is not bounded: the DOT chooses the layout engine (`layout` attribute) and its cost.

**Evidence**: tests tagged `SM-4` — the argv construction, the stream and file entry points with their failure paths, the output limit, abort and file replacement against the real `dot`, and the browser stubs.

## SM-5. Trusted code: models, plugins and contexts

Model classes, `ModelsContext` (`createModelsContext`), converter and printer plugins, and `react` components run with the application's privileges. Supplying a class or plugin that misbehaves, or calling an API in a way the types forbid, is a bug in the application, not a vulnerability in ts-graphviz. The library still fails safely where it can: an invalid edge target is a `TypeError` (`TSG_ERR_INVALID_EDGE_TARGETS`), a missing plugin is an `Error` (`TSG_ERR_NO_PLUGIN`), and `renderHTMLLike` in React limits recursion depth (default 1000) and detects cycles.

## SM-6. Supply chain

How the packages reach you is part of the model: the strongest parser is useless if the tarball is not the one built from this repository.

- Releases are published with npm provenance through OIDC trusted publishing; verify with `npm audit signatures`.
- GitHub Actions are pinned by commit SHA and linted with zizmor; CodeQL scans every push and pull request.
- Dependencies are updated by Dependabot with a cooldown, and pnpm enforces `minimumReleaseAge` and a trust policy so a freshly published malicious version is not installed automatically.
- OpenSSF Scorecard and the Best Practices badge track the remaining practices publicly.

## What is in scope for a security report

In scope, please report privately (see [SECURITY.md](https://github.com/ts-graphviz/ts-graphviz/blob/main/SECURITY.md)):

- any input to `parse` / `fromDot` that crashes the process, hangs, or exceeds the documented limits without throwing;
- any string that, as a plain `string` in a model, changes the DOT structure after `toDot` (injection);
- any exception from the documented APIs that is not a typed, coded error;
- the adapter starting a shell, or passing user data where a command or option belongs;
- a defect in the release pipeline or published artifacts.

Out of scope:

- behaviour of Graphviz itself on DOT that ts-graphviz produced faithfully (report to Graphviz; we will add guidance if the library can help);
- content placed in `htmlLike()` / `escString()` or JSX attributes by the application;
- custom model classes, plugins or `dotCommand` values supplied by the application;
- vulnerabilities in dependencies that ts-graphviz does not expose (report to the dependency; we still bump it).
