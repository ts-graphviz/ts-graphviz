import type { FileHandle } from 'node:fs/promises';
import { open } from 'node:fs/promises';
import type { Readable } from 'node:stream';
import { toStream } from './to-stream.node.js';
import type { Layout, Options } from './types.js';

/**
 * Execute the Graphviz dot command and output the results to a file.
 */
export async function toFile<T extends Layout>(
  dot: string,
  path: string,
  options?: Options<T>,
): Promise<void> {
  const stream = (await toStream(dot, options)) as Readable;
  // Open and write with positional arguments only, so that no options
  // object is read.
  let handle: FileHandle;
  try {
    handle = await open(path, 'w');
  } catch (error) {
    stream.destroy();
    throw error;
  }
  try {
    for await (const chunk of stream) {
      const buffer =
        typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Uint8Array);
      let offset = 0;
      while (offset < buffer.length) {
        const { bytesWritten } = await handle.write(
          buffer,
          offset,
          buffer.length - offset,
        );
        offset += bytesWritten;
      }
    }
  } catch (error) {
    stream.destroy();
    await handle.close().catch(() => {});
    throw error;
  }
  await handle.close();
}
