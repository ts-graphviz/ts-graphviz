/**
 * @module ts-graphviz/adapter
 * @beta
 */
import {
  type Layout,
  type Options,
  toFile as toFileFromDot,
  toStream as toStreamFromDot,
} from '@ts-graphviz/adapter';
import type { DotObjectModel } from '@ts-graphviz/common';
import { toDot } from './to-dot.js';

export * from '@ts-graphviz/adapter';

/**
 * What the adapter renders: a DOT source, or a model that is turned into
 * one with `toDot`.
 */
export type DotInput = string | DotObjectModel;

/**
 * Execute the Graphviz dot command and make a Web `ReadableStream` of the
 * results.
 *
 * @param input - A DOT source or a model (rendered with `toDot`).
 * @param options - Layout, output format and the other options of the command.
 */
export function toStream<T extends Layout>(
  input: DotInput,
  options?: Options<T>,
): Promise<ReadableStream<Uint8Array>> {
  return toStreamFromDot(toDotSource(input), options);
}

/**
 * Execute the Graphviz dot command and output the results to a file.
 *
 * @param input - A DOT source or a model (rendered with `toDot`).
 * @param path - The file to write.
 * @param options - Layout, output format and the other options of the command.
 */
export function toFile<T extends Layout>(
  input: DotInput,
  path: string,
  options?: Options<T>,
): Promise<void> {
  return toFileFromDot(toDotSource(input), path, options);
}

function toDotSource(input: DotInput): string {
  return typeof input === 'string' ? input : toDot(input);
}
