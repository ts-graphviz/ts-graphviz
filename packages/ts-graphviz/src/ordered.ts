/**
 * The same API as `ts-graphviz`, with the models of `orderedModels`: a
 * default attribute statement (`node [...]`, `edge [...]`, `graph [...]`)
 * written after other statements keeps its place, so it applies, as in
 * DOT, only to what follows it.
 *
 * ```ts
 * import { digraph, toDot } from 'ts-graphviz/ordered';
 *
 * const G = digraph('G', (g) => {
 *   g.node({ color: 'red' });
 *   g.node('a'); // red
 *   g.node({ color: 'blue' });
 *   g.node('b'); // blue
 * });
 * ```
 *
 * @module ts-graphviz/ordered
 */
import { type ModelsContext, ownOptions } from '@ts-graphviz/common';
import { orderedModels } from '@ts-graphviz/core';
import {
  fromDotAll as fromDotAllOf,
  fromDot as fromDotOf,
} from './from-dot.js';
import { withContext as withContextOf } from './model-factory.js';
import type {
  ModelFactories,
  ModelFactoriesWithStrict,
  ModelFactory,
} from './types.js';

export * from './ts-graphviz.js';

/** `orderedModels`, with the classes of `models` where it gives one. */
function withOrdered(
  models: Partial<ModelsContext> | undefined,
): Partial<ModelsContext> {
  const merged: Record<string, unknown> = { ...orderedModels };
  for (const [key, model] of Object.entries(ownOptions(models))) {
    if (model !== undefined) merged[key] = model;
  }
  return merged as Partial<ModelsContext>;
}

/** The options, with `orderedModels` under the classes of `convert.models`. */
function withOrderedOptions<
  T extends { convert?: { models?: Partial<ModelsContext> } },
>(options: T | undefined): T {
  const own = ownOptions(options);
  const convert = ownOptions(own.convert);
  return {
    ...own,
    convert: { ...convert, models: withOrdered(convert.models) },
  } as T;
}

const ordered: ModelFactoriesWithStrict = withContextOf(orderedModels);

/**
 * A factory for directed graphs whose default attribute statements keep
 * their place (`orderedModels`).
 * @group Model Factory
 */
export const digraph: ModelFactory = ordered.digraph;

/**
 * A factory for undirected graphs whose default attribute statements keep
 * their place (`orderedModels`).
 * @group Model Factory
 */
export const graph: ModelFactory = ordered.graph;

/**
 * The factories of strict graphs whose default attribute statements keep
 * their place (`orderedModels`).
 * @group Model Factory
 */
export const strict: ModelFactories = ordered.strict;

/**
 * Factories with the given classes and, for the kinds it leaves out, those
 * of `orderedModels`.
 *
 * @param models - The classes to create the models from.
 * @returns The factories `digraph`, `graph` and `strict` of that context.
 * @group Model Factory
 */
export const withContext: typeof withContextOf = (models) =>
  withContextOf(withOrdered(models) as typeof models);

/**
 * `fromDot` with the classes of `orderedModels` for the kinds
 * `convert.models` leaves out, so the models keep the default attribute
 * statements of the source in their place.
 * @group Convert DOT to Model
 */
export const fromDot: typeof fromDotOf = ((dot: string, options?: object) =>
  fromDotOf(dot, withOrderedOptions(options))) as typeof fromDotOf;

/**
 * `fromDotAll` with the classes of `orderedModels` for the kinds
 * `convert.models` leaves out, so the models keep the default attribute
 * statements of the source in their place.
 * @group Convert DOT to Model
 */
export const fromDotAll: typeof fromDotAllOf = ((
  dot: string,
  options?: object,
) => fromDotAllOf(dot, withOrderedOptions(options))) as typeof fromDotAllOf;
