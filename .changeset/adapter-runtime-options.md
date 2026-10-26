---
"@ts-graphviz/adapter": patch
---

The options the adapter gives Node.js and Deno to start the command, and the command line, no longer take anything from `Object.prototype`:

- `toStream` (Node.js) spawns `dot` with prototype-less options, `shell: false`, and an environment that is a prototype-less copy of `process.env`'s own variables. Before, an enumerable property on `Object.prototype` was added to the command's environment, and some Node.js releases read an inherited `shell`.
- The Deno entry passes `Deno.Command` and `Deno.open` prototype-less options.
- A hole in `library` is skipped instead of reading an inherited array index.
