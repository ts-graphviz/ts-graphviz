# Biome plugins

GritQL rules that `biome.json` enables for the packages' sources (not their tests). They keep the guarantees of SM-8 in the security model (`website/docs/ts-graphviz/11-advanced-topics/06-security-model.md`): nothing inherited from `Object.prototype` is read as an option or handed to the runtime.

| Rule | Reports |
| --- | --- |
| `no-inherited-option-reads.grit` | Destructuring (in a declaration or an assignment) of `options`, `opts`, `props`, `config`, `properties` or `….options` without `ownOptions()`. A variable assigned from `ownOptions()` / `ownAdapterOptions()` in the same function counts as already read, and so does `this.options` in a class that assigns it from `ownOptions()`. |
| `spawn-options-null-prototype.grit` | An options object without its own `__proto__: null` (one in a nested object does not count) given to `spawn`, `spawnSync` or `execFile` (in each of their call forms), `Deno.Command` or `Deno.open`, as the source of `ReadableStream` or `WritableStream`, or as the options of `new Blob`, also under up to three type assertions. |
| `no-node-stream-options.grit` | `createWriteStream` / `createReadStream`. Node.js copies their options into a plain object, so inherited `fd`, `start` or `flags` apply. |

The rules match by name and shape, so they are a safety net, not a proof. They do not see parameter destructuring (React components destructure their props), an options object passed on under another name, nested destructuring of a value read from `ownOptions()`, or an exemption in a nested function that reuses the variable name. `fixtures/` holds a case each rule must report (`bad.ts`) and code none may report (`good.ts`); `test/biome-plugins.test.ts` checks both.
