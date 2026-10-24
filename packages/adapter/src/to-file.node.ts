import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream as NodeWebReadableStream } from 'node:stream/web';
import { toStream } from './to-stream.node.js';
import type { Layout, Options } from './types.js';

/**
 * Execute the Graphviz dot command and output the results to a file.
 *
 * @param dot - The DOT source.
 * @param path - The file to write.
 * @param options - Layout, output format and the other options of the command.
 */
export async function toFile<T extends Layout>(
  dot: string,
  path: string,
  options?: Options<T>,
): Promise<void> {
  const stream = await toStream(dot, options);
  await pipeline(
    // The global ReadableStream type and node:stream/web's are the same at
    // runtime but distinct to TypeScript.
    Readable.fromWeb(stream as NodeWebReadableStream<Uint8Array>),
    createWriteStream(path),
  );
}
