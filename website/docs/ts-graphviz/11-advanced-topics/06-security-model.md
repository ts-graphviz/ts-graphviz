---
description: |-
  The security model of ts-graphviz: trust boundaries, the guarantees at each one, what is not promised, and the tests that enforce each guarantee.
---
# Security model

This document states what ts-graphviz trusts, what it guarantees at each boundary, what it does not promise, and which tests enforce each guarantee. It is the reference for deciding whether a report is a vulnerability (see [SECURITY.md](https://github.com/ts-graphviz/ts-graphviz/blob/main/SECURITY.md) for how to report one). The format follows the OpenSSF Best Practices "security assurance case": trust boundaries, guarantees, secure-design decisions and their evidence.

## Summary

Each boundary below has an identifier (`SM-1` … `SM-8`). Where a guarantee is enforced by tests, the tests carry the identifier in their title (for example `describe('[SM-2] …')`), and `test/security-model.test.ts` fails if an identifier claimed here has no test or a test names an identifier that is not here. The document therefore does not list test files; search the repository for the identifier.

ts-graphviz converts between three representations of a Graphviz graph: DOT text, an AST, and object models. The library itself performs no I/O: it does not touch the network or the file system and runs no code from its input. The only package that leaves the process is `@ts-graphviz/adapter`, which spawns the Graphviz `dot` executable.

| Boundary | Trusted? | Guarantee |
| --- | --- | --- |
| DOT text given to `parse` / `fromDot` | **untrusted** | terminates, bounded memory and stack, fails only with a typed, coded error |
| strings placed in models and written by `toDot` / `fromModel` | **untrusted** (as data) | written as literal text: cannot terminate the string, add statements or change the graph structure |
| `escString()` / `htmlLike()` values | **trusted** (caller opts in) | escape sequences / markup kept; only sanitised so they cannot end the string or label early (NUL rejected) |
| model classes, plugins, `ModelsContext`, `dotCommand` and other options | **trusted code and configuration** | none; misuse by the application is not a library vulnerability |
| `@ts-graphviz/adapter` | spawns `dot` with argv, no shell | no shell injection; the source is checked by `sanitize` unless the application turns it off |
| DOT text given to `sanitize` (and to the adapter by default) | **untrusted** | what passes contains nothing that makes Graphviz read a file or write an unsafe link, and is the text Graphviz gets |
| the npm packages themselves | supply chain | SHA-pinned actions, provenance, scorecard, dependency cooldown |
| `Object.prototype` and other state shared by the process | **untrusted** (may be polluted by other code) | options are read from their own properties only; exported data is frozen |

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
- **Bounded model conversion.** `fromDot` / `toModel` make an edge to a subgraph reach every node the subgraph has had so far, as Graphviz does. Since a subgraph opened again keeps its nodes, a short source could make that grow with the square of its length (`subgraph s { … } -> x` repeated). The node references all such edges reach are limited by `maxEdgeTargets` (100 000 by default, a `convert` option); past it, the conversion throws a `RangeError` with code `TSG_ERR_EDGE_TARGET_COUNT_EXCEEDED`.
- **No NUL characters.** Graphviz stops reading at a NUL, so a source containing one is rejected with `DotSyntaxError` instead of being read differently from Graphviz.
- **Typed, coded errors only.** For any string, `parse` either returns or throws `DotSyntaxError` (a `SyntaxError`, code `TSG_ERR_DOT_SYNTAX`) or another error carrying a `code` from `ERROR_CODES` (`isTsGraphvizError(e)` is true), so a caller can catch and classify every failure. (Passing a non-string is a type error on the caller's side.)
- **No code execution, no I/O.** Parsing produces plain objects. Attribute values are stored as text; nothing in the input is evaluated, resolved or fetched.
- **Faithful text.** A quoted string keeps its raw characters (including raw newlines and Graphviz escape sequences), and an HTML-like label is kept as markup. The parser does not interpret or sanitise them (see boundary 3 for what that means for consumers).

**Not promised**

- Semantic validity for Graphviz: the parser accepts the DOT grammar; whether Graphviz will render the result, or how long it takes, is outside the library.
- Protection against Graphviz-side issues in the file (e.g. an `image` attribute pointing at a local path) when the output is later rendered; see section 4.

**Evidence**: tests tagged `SM-1` — the `parse` and `model` fuzz targets (coverage-guided, nightly; `fuzz/README.md`), properties that arbitrary input either parses or throws a typed error and that whatever parses prints and parses again; the limit tests for input size, nesting depth, edge-chain depth and node count (including that the node count is per parse).

## SM-2. Application data → models → `toDot` (no DOT injection)

Applications build graphs from their own data: node ids from database keys, labels from user names. That data flows into DOT text, which Graphviz, other tools, or another ts-graphviz instance will parse.

**Guarantees**

- **A plain string is literal text.** Any `string` used as an id, port, attribute key or attribute value is escaped completely when written, so it cannot terminate the quoted string, add statements, or be read as an HTML-like label. `fromDot(toDot(g))` gives the same string back. An attribute value or id of another type, such as an array or object from parsed JSON, is converted with `String()` and escaped the same way (numbers and booleans excepted, below). A value that `String()` cannot convert, such as `Object.create(null)`, throws the `TypeError` it raises.
- **Values that must not be written are rejected.** A null character (`RangeError`, code `TSG_ERR_NUL_CHARACTER`) cannot be represented in DOT and is refused instead of dropped.
- **Booleans are written bare as `true`/`false`; numbers are written bare only in DOT's own numeral form.** Anything JavaScript could print differently (`1e21`, `NaN`, `Infinity`) is written as a quoted string.
- **Edge-target shorthand is the one place a string is parsed.** `g.edge(['a:p:n', 'b'])` splits the string on `:` into id, port and compass (as in DOT). An id that itself contains `:` must be given as `{ id: 'a:b' }`; then it is literal text like any other id.
- **Compass points are keywords, checked.** A compass point is written as it is, so `toDot` / `fromModel` accept only DOT's (`n`, `ne`, `e`, `se`, `s`, `sw`, `w`, `nw`, `c`, `_`) and reject anything else with a `TypeError` (code `TSG_ERR_INVALID_EDGE_TARGETS`), also in an edge target given as an object.
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
- An `htmlLike` value must have balanced `<`/`>` and no NUL; otherwise Graphviz would end the label early and read the rest as DOT. `htmlLike()` rejects such markup when the value is created (`RangeError`, code `TSG_ERR_INVALID_HTML_LIKE`), and the markup is checked again when written (`TSG_ERR_INVALID_HTML_LIKE`, or `TSG_ERR_NUL_CHARACTER` for a NUL).
- **Only the factories make these kinds.** `escString()` and `htmlLike()` mark their values with a non-enumerable property whose key is a registered symbol. Data cannot carry that mark: parsed JSON, a copy through `JSON.stringify`, or an object built with the same fields. So `{ "$$kind": "html", "value": "…" }` from a request is not an HTML-like label. Like any other non-string value, it is written as escaped text.

**Not promised**

- **The content of an HTML-like label is not sanitised.** Graphviz interprets it (tables, fonts, `IMG SRC`, `HREF`). Passing untrusted text through `htmlLike()` is the application's responsibility; use a plain string (escaped as text) unless the markup is yours.
- **What an attribute value means.** The React renderer below keeps a value inside its attribute, but a URL in `href` or a path in `src` is passed as given; an application that puts user data there decides whether it is acceptable (and `sanitize` checks the DOT before rendering, SM-7).

**The React renderer** (`renderHTMLLike` and JSX labels in `@ts-graphviz/react`) builds the markup from elements, and its strings are data:

- A string or number, as a child or as an attribute value, is text: `&`, `<`, `>` (and `"` in an attribute) are written as entities, so it cannot add elements, add attributes or end the label (#1745).
- Only the elements of HTML-like labels are written; any other element, an attribute name that is not a name, a circular tree or a tree deeper than `maxDepth` throws (`TypeError` / `RangeError`) instead of being written.

**Evidence**: tests tagged `SM-3` — properties that escString values print idempotently and never break out of the string and that htmlLike values round-trip exactly or are rejected, and that any string given to the React renderer as a child or attribute value comes back unchanged as text inside the one element; the unit tests of the sanitising and validation rules and of the React HTML-like renderer.

## SM-4. `@ts-graphviz/adapter` (running Graphviz)

`toStream` / `toFile` spawn the Graphviz executable. This is the one place where ts-graphviz has side effects and where the *rendered* DOT matters.

**Guarantees**

- **No shell.** The command is started with `child_process.spawn` (Node.js) or `Deno.Command` with an argument array; nothing is interpolated into a shell string, so option values and DOT text cannot inject commands.
- **Typed failures.** A command that cannot start, cannot be written to, or exits non-zero rejects with `CommandExecutionError` (code `TSG_ERR_COMMAND_FAILED`, with `command`, the underlying `cause`, and `exit.code` / `exit.signal` / `exit.stderr` when the process did start); in a browser the functions throw `TSG_ERR_UNSUPPORTED_ENVIRONMENT`.
- **Web streams on every runtime**, so the output is consumed the same way on Node.js and Deno.
- **Bounded output.** The output kept in memory is limited by `maxOutputSize` (default 128 MiB; the command is killed and the call rejects with a `RangeError`, code `TSG_ERR_OUTPUT_LIMIT_EXCEEDED`); the command's stderr is kept to its last 64 KiB.
- **Stoppable.** With `signal`, the command is killed when the signal aborts and the call rejects with `signal.reason`; `AbortSignal.timeout(ms)` gives a time limit.
- **Files are replaced, not patched.** `toFile` writes only after the command succeeded and truncates an existing file.
- **Checked source by default.** Unless `sanitize: false` is set, the source is checked by `sanitize` (SM-7) before the command starts, and the command gets the checked text; a model rendered through `ts-graphviz/adapter` is checked the same way after `toDot`.

**Not promised, and what the application must do**

- `dotCommand`, `library`, `layout`, `format` and the other options are configuration: never derive them from end-user input. The one exception that is checked is `attributes` (the `-G` / `-N` / `-E` arguments): while `sanitize` is on, its keys and values are checked by the same rules as the DOT source, split at the first `=` as Graphviz splits them.
- **Graphviz reads local files named in the DOT and can copy them into its output**, and writes URLs into SVG (details in SM-7). With `sanitize: false`, ts-graphviz passes the DOT through unchanged: do that only for DOT the application wrote itself. For untrusted DOT, also run Graphviz as an unprivileged user in an isolated file system, and set `signal` and `maxOutputSize`.
- Without `signal`, layout time is not bounded: the DOT chooses the layout engine (`layout` attribute) and its cost.

**Evidence**: tests tagged `SM-4` and the `adapter-args` fuzz target — the argv construction, the stream and file entry points with their failure paths, the output limit, abort and file replacement against the real `dot`, and the browser stubs.

## SM-5. Trusted code: models, plugins and contexts

Model classes, `ModelsContext` (`createModelsContext`), converter and printer plugins, and `react` components run with the application's privileges. Supplying a class or plugin that misbehaves, or calling an API in a way the types forbid, is a bug in the application, not a vulnerability in ts-graphviz. The library still fails safely where it can: an invalid edge target is a `TypeError` (`TSG_ERR_INVALID_EDGE_TARGETS`), a missing plugin is an `Error` (`TSG_ERR_NO_PLUGIN`), and `renderHTMLLike` in React limits recursion depth (default 1000) and detects cycles.

**Type extensions** (augmenting `$keywords` types such as attribute keys, `Layout` or `Format`, see *Extending ts-graphviz*) change TypeScript types only: they add no code that runs and are not an attack surface of their own. They are also invisible to `sanitize`, which checks what is in the DOT at run time: under the default policy a custom attribute gets the checks every value gets, the strict policy rejects it, and a custom output format is refused while `sanitize` is on. Extending, and deciding to render a custom attribute or format from untrusted input, is the application's responsibility.

## SM-6. Supply chain

How the packages reach you is part of the model: the strongest parser is useless if the tarball is not the one built from this repository.

- Releases are published with npm provenance through OIDC trusted publishing; verify with `npm audit signatures`.
- GitHub Actions are pinned by commit SHA and linted with zizmor; CodeQL scans every push and pull request.
- Dependencies are updated by Dependabot with a cooldown, and pnpm enforces `minimumReleaseAge` and a trust policy so a freshly published malicious version is not installed automatically.
- OpenSSF Scorecard and the Best Practices badge track the remaining practices publicly.

## SM-7. `sanitize` (rendering untrusted DOT)

Graphviz has no sandbox. Verified with Graphviz 2.43: an EPS file named by `shapefile` (with `shape=epsf`) or by `image` is copied into `-Tps` output; `image` and HTML-like `<IMG SRC>` embed images in raster output and reveal paths and sizes in SVG; `stylesheet` and URL attributes (`URL`, `href`, …, and `HREF` in HTML-like labels) are written into SVG, so a `javascript:` URL becomes script when the SVG is served inline. Graphviz keeps character references such as `&#58;` in the links it writes and expands `\N`-style escapes in URLs; PostScript output and image maps contain some values unescaped. The old `GV_FILE_PATH` restriction was removed in Graphviz 6. `sanitize` from `@ts-graphviz/ast`, which the adapter runs by default, is the supported way to render DOT from an untrusted party.

**Guarantees**

- **Parsed, not pattern-matched.** The source is parsed with the SM-1 limits, checked on the AST, and printed again; the returned text (the one the adapter renders) is printed from the checked AST, never copied from the input, so Graphviz reads what was checked. That this text means the same to Graphviz as to the parser is what the differential test and the fuzz targets of SM-1 and SM-2 check.
- **Rejected**, with a `DOMException` named `SecurityError` and code `TSG_ERR_UNSAFE_DOT` naming the attribute and its position:
  - `image`, `shapefile`, `imagepath`, `fontpath`, `stylesheet` and the xdot drawing programs (`_draw_`, `_ldraw_`, …, `_background`), on any statement and in any case;
  - URL attributes (`URL`, `href`, `edgeURL`, `headURL`, `tailURL`, `labelURL` and their `href` forms, `HREF` in HTML-like labels) unless relative or `http`, `https` or `mailto`, or when they contain whitespace or a control character (a line break adds a directive to `-Timap` image maps), a quote or angle bracket (SVG output writes the link between quotes unescaped, so a quote, also one decoded from `&quot;` in an HTML-like label, ends the attribute), or a backslash escape (`\N` expands to the node name);
  - `<IMG>` and any `SRC` in HTML-like strings, and markup that cannot be read as XML;
  - font names (`fontname`, `labelfontname`, `FACE`) other than letters, digits and `_ . , : = + -`, with spaces allowed except for PostScript formats: a path names a font file, and Graphviz writes the name raw into PostScript, where any other character, and a space between words, is code;
  - `style` values other than known styles and `setlinewidth(n)` (written raw into PostScript), with line breaks, or with spaces for `plain` formats; `shape` values other than names; colors with characters outside the color syntax (letters, digits, `# / : ; . , _ + -`) — `plain` output writes style, shape and colors as raw fields;
  - substitution escapes (`\N`, `\G`, `\E`, `\T`, `\H`, `\L`) that could assemble a character reference after Graphviz expands them: `&` in a value with an escape, a name containing `&` when some value mixes an escape with other text, and `\L` (a copy of a label, which Graphviz decodes) outside label and tooltip text;
  - control characters anywhere (copied into JSON and XML output, which cannot hold them), line breaks in names, ports and `comment` (raw in PostScript comments), and named character references other than XML's outside label and tooltip text (copied as written into SVG, where they are undefined).

  Each check runs on every reading of a value, from as written to fully decoded, because HTML-like labels are decoded by Graphviz's XML parser and the SVG again by the browser.
- **Strict policy.** With `policy: 'strict'`, `sanitize` also rejects every attribute ts-graphviz does not know (exact names, from the generated attribute types; the compiler keeps the two in sync), values outside numbers, names and lists (no quotes, backslashes, `< > & ( ) %` or line breaks) for attributes without a grammar of their own, and HTML-like label tags and attributes Graphviz does not define. Attributes and output quirks nobody has listed yet cannot get through it; use it for DOT from parties you do not trust at all.
- **Output formats.** Without a format, `sanitize` applies the rules of every checked format at once (no spaces in font names or styles). Given the output format (the adapter always passes it), it applies only that format's rules, rejects `ismap` (it writes each area's tooltip, which defaults to the label, raw on the line of its URL, so an ordinary `\n` adds a line), and rejects every format not checked. Checked with Graphviz 2.43: `svg`, `svgz`, `png`, `jpg` / `jpeg` / `jpe`, `gif`, `webp`, `pdf`, `json`, `json0`, `dot_json`, `xdot_json`, `xdot`, `dot`, `gv`, `canon`, `plain`, `plain-ext`, `ps`, `ps2`, `eps`, `imap`, `imap_np`, `cmapx`, `cmapx_np`, with any renderer suffix (`png:cairo`).

**Not promised**

- Layout cost: `layout`, `size`, `dpi`, `maxiter` and the like pass; bound them with `signal` and `maxOutputSize` (SM-4).
- Text in the output: labels, tooltips, ids and comments are written by Graphviz as text (escaped in SVG); applications that put the output into HTML in other ways must escape it themselves.
- Under the default policy, attributes that newer Graphviz versions may add: it is a list of what is known to read files, write links or reach an output unescaped. The strict policy does not have this gap.

**Evidence**: tests tagged `SM-7` — unit tests for each rule, including the encoded and escaped forms, checked against real Graphviz output; properties that `sanitize` either rejects generated DOT or returns text that parses to the same AST and is a fixed point; unit tests of the strict policy's allowlists; a test against the real `dot`, under both policies, that every link in the SVG written for accepted DOT, decoded as a browser decodes it, is relative or `http`, `https` or `mailto` (link values built from encoded schemes, references at several levels, `\N` and whitespace; it fails when `sanitize` is bypassed); a test, under both policies, that a source full of awkward but accepted values renders to every checked format and each output holds together (JSON parses, DOT reads back, `plain` and image maps hold only their own records, PostScript font settings are one token); and the adapter tests that an unsafe source is rejected before the command starts while `sanitize: false` lets the real `dot` copy a file into its output.

## What is in scope for a security report

In scope, please report privately (see [SECURITY.md](https://github.com/ts-graphviz/ts-graphviz/blob/main/SECURITY.md)):

- any input to `parse` / `fromDot` that crashes the process, hangs, or exceeds the documented limits without throwing;
- any string that, as a plain `string` in a model, changes the DOT structure after `toDot` (injection);
- any exception from the documented APIs that is not a typed, coded error;
- the adapter starting a shell, or passing user data where a command or option belongs;
- DOT that passes `sanitize` and still makes Graphviz read a file or write a `javascript:` (or other non-allowed) link;
- a defect in the release pipeline or published artifacts.

Out of scope:

- behaviour of Graphviz itself on DOT that ts-graphviz produced faithfully (report to Graphviz; we will add guidance if the library can help);
- content placed in `htmlLike()` / `escString()` or JSX attributes by the application;
- custom model classes, plugins or `dotCommand` values supplied by the application;
- vulnerabilities in dependencies that ts-graphviz does not expose (report to the dependency; we still bump it).

## SM-8. State shared by the process (prototype pollution)

ES modules, and the built-in prototypes, are shared by every module of a process. A bug elsewhere in the application (a deep merge, a query-string or JSON parser) can add properties to `Object.prototype`; such a polluted property must not change what ts-graphviz does.

**Guarantees**

- **Options are own properties.** Every public entry point reads its options object, and the option objects nested in it (`attributes` and its `graph` / `node` / `edge`, a `sanitize` options object, `parse`, `convert`, `print`), from their own enumerable properties only (`ownOptions` in `@ts-graphviz/common`). An inherited property never chooses the command (`dotCommand`), turns `sanitize` off, adds arguments (`library`, `-G`), raises a parse limit or changes what is parsed or printed (#1757).
- **Process options and the command line are own properties.** The Node.js entry spawns `dot` with options that have no prototype, `shell: false`, and an environment that is a prototype-less copy of `process.env`'s own variables (`child_process.spawn` would otherwise copy inherited enumerable keys into the child's environment, and some Node.js releases read an inherited `shell`). The Deno entry passes `Deno.Command` and `Deno.open` prototype-less options. Only the array elements of `library` that the array owns are passed; a hole is skipped.
- **No shared configuration.** Importing a package changes no shared state (v4 removed the shared models context, see the v3-to-v4 guide); defaults come from frozen objects (`defaultModelsContext()`, `orderedModels`, the model factories).
- **Exported data is frozen.** `ERROR_CODES` and `DEPRECATION_CODES` cannot be changed, so no module can change what `isTsGraphvizError` accepts.

**Not promised**

- **Code running in the process is trusted** (SM-5). The exported classes and functions are not frozen, so that tests can spy on them and applications can extend them; code that replaces a method of an exported class, or a built-in such as `String.prototype.replaceAll`, can change what the library does. Freezing would not stop it: such code can change the built-ins the library itself relies on.
- `onDeprecation` listeners and the deprecation report (once per code) are process-wide by design.

**Evidence**: tests tagged `SM-8` — properties that, with any option name of any entry point set on `Object.prototype` to an arbitrary value, the adapter's command, arguments and checked source, `parse`, `sanitize`, `fromDot`, `toDot` and `renderHTMLLike` give what they give on a clean prototype; and that the exported data is frozen.
