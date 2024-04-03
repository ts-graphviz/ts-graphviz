import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { toStream } from './to-stream.node.js';
import type { Layout, Options } from './types.js';

/**
 * Execute the Graphviz dot command and output the results to a file.
 * @typeParam T - Layout engine.
 * @param dot - Source of the graph written in the DOT language.
 * @param path - Path of the output file.
 * @param options - Options for setting layout engine and output format.
 * @returns A promise that resolves when the file has been written.
 * @public
 */
export async function toFile<T extends Layout>(
  dot: string,
  path: string,
  options?: Options<T>,
): Promise<void> {
  const stream = await toStream(dot, options);
  await pipeline(stream, createWriteStream(path));
}
