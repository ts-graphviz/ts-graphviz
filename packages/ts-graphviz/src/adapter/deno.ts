import { Layout, Options } from './types.js';
import { createCommandAndArgs } from './utils.js';

/**
 * Execute the Graphviz dot command and make a Stream of the results.
 */
export async function toStream<T extends Layout>(
  dot: string,
  options?: Options<T>,
): Promise<ReadableStream<Uint8Array>> {
  const [command, args] = createCommandAndArgs(options ?? {});
  const cp = new Deno.Command(command, {
    args: args,
    stdin: 'piped',
    stdout: 'piped',
  }).spawn();
  const stdin = cp.stdin.getWriter();
  await stdin.write(new TextEncoder().encode(dot));
  await stdin.close();
  return cp.stdout;
}

function open(path: string) {
  try {
    return Deno.open(path, { write: true });
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      return Deno.open(path, { createNew: true, write: true });
    }
    throw e;
  }
}

/**
 * Execute the Graphviz dot command and output the results to a file.
 */
export async function toFile<T extends Layout>(
  dot: string,
  path: string,
  options?: Options<T>,
): Promise<void> {
  const output = await open(path);
  const stream = await toStream(dot, options);
  await stream.pipeTo(output.writable);
}
