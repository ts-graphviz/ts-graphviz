# Security model

This document states what ts-graphviz trusts, what it guarantees at each boundary, what it does not promise, and which tests enforce each guarantee. It is the reference for deciding whether a report is a vulnerability (see [SECURITY.md](../SECURITY.md) for how to report one). The format follows the OpenSSF Best Practices "security assurance case": trust boundaries, guarantees, secure-design decisions and their evidence.

## Summary

ts-graphviz converts between three representations of a Graphviz graph: DOT text, an AST, and object models. The library itself performs no I/O: it does not touch the network or the file system and runs no code from its input. The only package that leaves the process is `@ts-graphviz/adapter`, which spawns the Graphviz `dot` executable.

| Boundary | Trusted? | Guarantee |
| --- | --- | --- |
| DOT text given to `parse` / `fromDot` | **untrusted** | terminates, bounded memory and stack, fails only with a typed, coded error |
| strings placed in models and written by `toDot` / `fromModel` | **untrusted** (as data) | written as literal text: cannot terminate the string, add statements or change the graph structure |
| `escString()` / `htmlLike()` values | **trusted** (caller opts in) | written verbatim; validated only for shape (balanced `<` `>`, no NUL) |
| model classes, plugins, `ModelsContext`, `dotCommand` and other options | **trusted code and configuration** | none; misuse by the application is not a library vulnerability |
| `@ts-graphviz/adapter` | spawns `dot` with argv, no shell | no shell injection; the DOT it renders is still interpreted by Graphviz |
| the npm packages themselves | supply chain | SHA-pinned actions, provenance, scorecard, dependency cooldown |

## 1. DOT text → `parse` / `fromDot` (untrusted input)

The parser is the component most exposed to attacker-controlled data: a web service that renders user-uploaded DOT files passes them straight to it.

**Guarantees**

- **Termination and bounded resources.** The grammar is a PEG parser with these limits, all configurable through `ParseOptions`:

  | Limit | Option | Default |
  | --- | --- | --- |
  | input size | `maxInputSize` | 10 MiB |
  | HTML-like label nesting | `maxHtmlNestingDepth` | 100 |
  | edge chain length (`a -> b -> c …`) | `maxEdgeChainDepth` | 1000 |
  | AST node count | `maxASTNodes` | 100 000 |

  Exceeding a limit throws before the structure is built. Setting a limit to `0` disables it; do not do that for untrusted input.
- **Typed, coded errors only.** A DOT source either parses or throws `DotSyntaxError` (a `SyntaxError`, code `TSG_ERR_DOT_SYNTAX`) or another error carrying a `code` from `ERROR_CODES` (`isTsGraphvizError(e)` is true). No other exception escapes, so a caller can catch and classify every failure.
- **No code execution, no I/O.** Parsing produces plain objects. Attribute values are stored as text; nothing in the input is evaluated, resolved or fetched.
- **Faithful text.** A quoted string keeps its raw characters (including raw newlines and Graphviz escape sequences), and an HTML-like label is kept as markup. The parser does not interpret or sanitise them (see boundary 3 for what that means for consumers).

**Not promised**

- Semantic validity for Graphviz: the parser accepts the DOT grammar; whether Graphviz will render the result, or how long it takes, is outside the library.
- Protection against Graphviz-side issues in the file (e.g. an `image` attribute pointing at a local path) when the output is later rendered; see section 4.

**Evidence**

- `test/properties/dot-roundtrip.property.test.ts` → "parser robustness": arbitrary input either parses or throws a typed error; whatever parses prints and parses again.
- `test/properties/ast-roundtrip.property.test.ts` → "printer and parser": `parse(stringify(ast))` rebuilds the same tree; printing is stable.
- `packages/ast/src/dot-shim/parser/parse.test.ts` → the limit tests (input size, nesting depth, edge chain depth, node count) and the `DotSyntaxError` cases.
- `packages/ast/src/builder/create-element.test.ts` → the node-count limit is per parse, not per process.

## 2. Application data → models → `toDot` (no DOT injection)

Applications build graphs from their own data: node ids from database keys, labels from user names. That data flows into DOT text, which Graphviz, other tools, or another ts-graphviz instance will parse.

**Guarantees**

- **A plain string is literal text.** Any `string` used as an id, port, attribute key or attribute value is escaped completely when written, so it cannot terminate the quoted string, add statements, or be read as an HTML-like label. `fromDot(toDot(g))` gives the same string back.
- **Values that must not be written are rejected.** A null character (`RangeError`, code `TSG_ERR_NUL_CHARACTER`) cannot be represented in DOT and is refused instead of dropped.
- **Numbers and booleans are written bare only in DOT's own numeral form.** Anything JavaScript could print differently (`1e21`, `NaN`, `Infinity`) is written as a string.
- **Keys cannot smuggle syntax.** Attribute keys that are DOT keywords or not plain identifiers are quoted; a `__proto__` key from parsed input lands on a null-prototype record and does not change the object's prototype.

**Not promised**

- The meaning Graphviz gives to a value. A plain string `\N` is written so that Graphviz shows the two characters `\N`; an application that wants the node-name substitution uses `escString('\\N')` on purpose (section 3). What text is appropriate to show is the application's decision.

**Evidence**

- `test/properties/dot-roundtrip.property.test.ts` → "no DOT injection: any string survives toDot → fromDot unchanged", "printing is idempotent", "raw newlines in values survive", "any JS number produces DOT that parses back to the same number", "attribute keys that are DOT keywords or not identifiers are quoted", "writes non-numeral numbers as strings and keeps a `__proto__` key", and the regression cases for #1587.
- `packages/ast/src/model-shim/literal.test.ts` → the escaping rules and the NUL rejection.

## 3. `escString()` and `htmlLike()` (caller opts out of escaping)

Two value kinds deliberately bypass the literal-text rule because their content *is* DOT syntax:

- `escString(text)` keeps Graphviz escape sequences (`\N`, `\G`, `\l`, …) meaningful. Only `"` is escaped, and the text is sanitised so it cannot end the string early.
- `htmlLike(markup)` writes an HTML-like label `<…>` verbatim.

**Guarantees**

- An `escString` value cannot terminate the quoted string or add statements.
- An `htmlLike` value must have balanced `<`/`>` and no NUL (`RangeError`, code `TSG_ERR_INVALID_HTML_LIKE`); otherwise Graphviz would end the label early and read the rest as DOT.

**Not promised**

- **The content of an HTML-like label is not sanitised.** Graphviz interprets it (tables, fonts, `IMG SRC`, `HREF`). Passing untrusted text through `htmlLike()` is the application's responsibility; use a plain string (escaped as text) unless the markup is yours. The React package builds HTML-like labels from JSX, so text nodes in JSX are escaped, but attributes such as `href` and `src` are passed through.

**Evidence**

- `test/properties/dot-roundtrip.property.test.ts` → "explicit value kinds": escString values print idempotently and never break out of the string; htmlLike values round-trip exactly; unbalanced markup is rejected.
- `packages/ast/src/model-shim/literal.test.ts` (escString sanitising, htmlLike validation), `packages/react/src/renderHTMLLike.test.tsx`.

## 4. `@ts-graphviz/adapter` (running Graphviz)

`toStream` / `toFile` spawn the Graphviz executable. This is the one place where ts-graphviz has side effects and where the *rendered* DOT matters.

**Guarantees**

- **No shell.** The command is started with `child_process.spawn` (Node.js) or `Deno.Command` with an argument array; nothing is interpolated into a shell string, so option values and DOT text cannot inject commands.
- **Typed failures.** A command that cannot start or exits non-zero rejects with `CommandExecutionError` (code `TSG_ERR_COMMAND_FAILED`, with `command`, `exit.code`, `exit.signal`, `exit.stderr`); in a browser the functions throw `TSG_ERR_UNSUPPORTED_ENVIRONMENT`.
- **Web streams on every runtime**, so the output is consumed the same way on Node.js and Deno.

**Not promised, and what the application must do**

- `dotCommand`, `library` and the other options are configuration: never derive them from end-user input.
- Graphviz reads attributes such as `image`, `shapefile`, `imagepath`, `fontpath` and `fontname` as file-system references and may read local files while rendering. ts-graphviz passes DOT through unchanged. When rendering DOT from untrusted sources, validate or strip those attributes first (`packages/adapter/README.md` has an example), run Graphviz with restricted permissions, and bound its running time.
- Rendering time and memory of Graphviz itself are not bounded by this library.

**Evidence**

- `packages/adapter/src/to-stream.node.test.ts`, `to-file.node.test.ts`, `create-command-args.test.ts`, `browser.test.ts`.

## 5. Trusted code: models, plugins and contexts

Model classes, `ModelsContext` (`createModelsContext`), converter and printer plugins, and `react` components run with the application's privileges. Supplying a class or plugin that misbehaves, or calling an API in a way the types forbid, is a bug in the application, not a vulnerability in ts-graphviz. The library still fails safely where it can: an invalid edge target is a `TypeError` (`TSG_ERR_INVALID_EDGE_TARGETS`), a missing plugin is an `Error` (`TSG_ERR_NO_PLUGIN`), and `renderHTMLLike` in React limits recursion depth (default 1000) and detects cycles.

## 6. Supply chain

How the packages reach you is part of the model: the strongest parser is useless if the tarball is not the one built from this repository.

- Releases are published with npm provenance through OIDC trusted publishing; verify with `npm audit signatures`.
- GitHub Actions are pinned by commit SHA and linted with zizmor; CodeQL scans every push and pull request.
- Dependencies are updated by Dependabot with a cooldown, and pnpm enforces `minimumReleaseAge` and a trust policy so a freshly published malicious version is not installed automatically.
- OpenSSF Scorecard and the Best Practices badge track the remaining practices publicly.

## What is in scope for a security report

In scope, please report privately (see [SECURITY.md](../SECURITY.md)):

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
