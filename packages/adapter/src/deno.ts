/// <reference lib="dom" />
export type * from './types.js';

import { createCommandAndArgs } from './create-command-and-args.js';
/**
 * @module @ts-graphviz/adapter
 */
import type { Layout, Options } from './types.js';

declare let Deno: any;

/**
 * Execute the Graphviz dot command and make a Stream of the results.
 */
export async function toStream<T extends Layout>(
  dot: string,
  options?: Options<T>,
): Promise<ReadableStream<Uint8Array>> {
  const [command, args] = createCommandAndArgs(options ?? {});
  // Options without a prototype: nothing inherited from Object.prototype is
  // read as an option.
  const cp = new Deno.Command(command, {
    __proto__: null,
    args: args,
    stdin: 'piped',
    stdout: 'piped',
  }).spawn();
  const stdin = cp.stdin?.getWriter();
  await stdin.write(new TextEncoder().encode(dot));
  await stdin.close();
  return cp.stdout;
}

/**
 * Execute the Graphviz dot command and output the results to a file.
 */
export async function toFile<T extends Layout>(
  dot: string,
  path: string,
  options?: Options<T>,
): Promise<void> {
  const stream = await toStream(dot, options);
  // Created if missing and emptied if present, so the file holds exactly
  // this output.
  const output = await Deno.open(path, {
    __proto__: null,
    write: true,
    create: true,
    truncate: true,
  });
  await stream.pipeTo(output.writable);
}
