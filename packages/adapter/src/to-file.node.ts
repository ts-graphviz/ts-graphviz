import { open } from 'node:fs/promises';
import { toStream } from './to-stream.node.js';
import type { Layout, Options } from './types.js';

/**
 * Execute the Graphviz dot command and output the results to a file.
 *
 * @param dot - The DOT source.
 * @param path - The file to write.
 * @param options - Layout, output format and the other options of the command.
 */
export async function toFile<
  const F extends string = never,
  const L extends string = never,
  T extends Layout | L = Layout | L,
>(dot: string, path: string, options?: Options<T, F, L>): Promise<void> {
  const stream = await toStream(dot, options);
  // Opened and written with positional arguments only: Node.js copies a
  // stream's options object into a plain one, so an options object would
  // let an inherited `fd`, `start` or `flags` choose where the output goes.
  const file = await open(path, 'w');
  try {
    for await (const chunk of stream) {
      let offset = 0;
      while (offset < chunk.byteLength) {
        const { bytesWritten } = await file.write(
          chunk,
          offset,
          chunk.byteLength - offset,
        );
        offset += bytesWritten;
      }
    }
  } finally {
    await file.close();
  }
}
