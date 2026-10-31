/**
 * @module ts-graphviz/adapter
 * @beta
 */
import {
  type Layout,
  type Options,
  toBlob as toBlobFromDot,
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
 * Execute the Graphviz dot command and return its output as a `Blob`.
 *
 * @param input - A DOT source or a model (rendered with `toDot`).
 * @param options - Layout, output format and the other options of the command.
 */
export function toBlob<
  const F extends string = never,
  const L extends string = never,
  T extends Layout | L = Layout | L,
>(input: DotInput, options?: Options<T, F, L>): Promise<Blob> {
  return toBlobFromDot<F, L, T>(toDotSource(input), options);
}

function toDotSource(input: DotInput): string {
  return typeof input === 'string' ? input : toDot(input);
}
