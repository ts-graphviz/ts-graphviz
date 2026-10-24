# Fuzzing

Coverage-guided fuzzing with [Jazzer.js](https://github.com/CodeIntelligenceTesting/jazzer.js) (libFuzzer for Node.js). It complements the property-based tests in `test/properties`: the properties check the inputs our generators produce, while the fuzzer mutates inputs towards code paths no test reached yet.

## Targets

| Target | What must hold | Security model |
| --- | --- | --- |
| `parse` | `parse(s)` returns or throws a coded error; whatever parses prints to text that parses back to the same tree | SM-1 |
| `model` | `fromDot(s)` returns a model or throws a coded error; `toDot` of that model reads back and prints identically | SM-1, SM-2 |
| `adapter-args` | whatever option values an application passes, the argv given to `dot` has one flag per option and nothing else | SM-4 |

A target signals a finding by throwing `Finding` (`fuzz/targets/expect.ts`).

## Running

```sh
pnpm fuzz:build             # bundle fuzz/targets/*.fuzz.ts to CommonJS in fuzz/dist
pnpm fuzz parse 600         # fuzz one target for 600 seconds
fuzz/minimize.sh parse fuzz/findings/parse/crash-<hash>   # shrink a finding
```

- Jazzer.js instruments code loaded through CommonJS `require`, so each target is bundled with the library sources inlined (`fuzz/vite.config.ts`); rebuild after changing the library.
- The corpus grows in `fuzz/corpus/<target>` and is seeded from `test/dot/*.dot`; findings land in `fuzz/findings/<target>`. Both are git-ignored.
- `fuzz/dot.dict` gives libFuzzer DOT tokens to splice in.
- The nightly workflow (`.github/workflows/nightly-properties.yaml`) runs every target for 15 minutes and uploads findings as an artifact.

## When a finding comes in

1. Minimize it and reproduce it in a unit test.
2. A plain bug gets a fix and the test as a regression test (tag the test with the security-model identifier it falls under).
3. A finding with security impact (a DOT injection, an uncaught error type, an unbounded resource) goes through the private reporting process in `SECURITY.md` first.
