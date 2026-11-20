/**
 * @module ts-graphviz/adapter
 * @beta
 */
import {
  type Layout,
  type Options,
  type SchemaLayout,
  toBlob as toBlobFromDot,
} from '@ts-graphviz/adapter';
import type {
  AnyReadonlyDotObjectModel,
  EmptySchema,
  ModelView,
  Schema,
} from '@ts-graphviz/common';
import { toDot } from './to-dot.js';

export * from '@ts-graphviz/adapter';

/**
 * What the adapter renders: a DOT source, or a model that is turned into
 * one with `toDot` (any model, or its DSL: it is only read).
 */
export type DotInput = string | AnyReadonlyDotObjectModel | ModelView;

/**
 * Execute the Graphviz dot command and return its output as a `Blob`.
 *
 * @param input - A DOT source or a model (rendered with `toDot`).
 * @param options - Layout, output format and the other options of the command.
 */
export function toBlob<
  const S extends Schema = EmptySchema,
  T extends Layout | SchemaLayout<S> = Layout | SchemaLayout<S>,
>(input: DotInput, options?: Options<T, S>): Promise<Blob> {
  return toBlobFromDot<S, T>(toDotSource(input), options);
}

function toDotSource(input: DotInput): string {
  return typeof input === 'string' ? input : toDot(input);
}
