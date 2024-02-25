import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { toStream } from './to-stream.node.js';
import { Layout, Options } from './types.js';

/**
 * Execute the Graphviz dot command and output the results to a file.
 */
export async function toFile<T extends Layout>(
  dot: string,
  path: string,
  options?: Options<T>,
): Promise<void> {
  const stream = await toStream(dot, options);
  await pipeline(stream, createWriteStream(path));
}
