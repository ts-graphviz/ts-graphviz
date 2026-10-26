---
"@ts-graphviz/adapter": patch
---

The Node.js entry no longer gives Node.js streams options objects, so no data value on `Object.prototype` changes where the output goes or what it contains (the v4 counterpart of #1768 in 3.x):

- `toFile` opens its file with `fs.promises.open(path, 'w')` and writes it with positional `write` calls. Before, `createWriteStream` copied its options into a plain object, so an inherited `fd`, `start` or `flags` sent the output to another descriptor, shifted it, or appended it.
- `toStream` writes the source to the command as bytes. It reads the command's output as bytes even with an inherited `encoding`, and returns it in a Web stream built from a prototype-less source instead of through `Readable.from` / `Readable.toWeb`. It releases each pipe once the pipe has ended, so an inherited `allowHalfOpen` no longer keeps the call waiting forever. It also fails, instead of succeeding, when the command closes its input before reading all of it.
- The Deno entry builds its result stream from a prototype-less source.
- The build keeps every `node:` module external. Before, a `node:` module not on the list was replaced with an empty browser stub.
