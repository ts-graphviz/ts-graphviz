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
import type { ParseOptions } from '@ts-graphviz/ast';
import {
  type EdgeModel,
  type ModelsContext,
  type NodeModel,
  ownOptions,
  type ResolvedModelTypes,
  type RootGraphModel,
  type SubgraphModel,
} from '@ts-graphviz/common';
import { orderedModels } from '@ts-graphviz/core';
import {
  type FromDotModel,
  type FromDotOptions,
  type FromDotRule,
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
export function withContext<const P extends Partial<ModelsContext>>(
  models: P,
): ModelFactoriesWithStrict<ResolvedModelTypes<P>> {
  return withContextOf(withOrdered(models) as P);
}

// The signatures below are those of `ts-graphviz`; `pnpm api:check` fails
// if the API of `ts-graphviz/ordered` and that of `ts-graphviz` differ.

/**
 * `fromDot` with the classes of `orderedModels` for the kinds
 * `convert.models` leaves out, so the models keep the default attribute
 * statements of the source in their place.
 *
 * @group Convert DOT to Model
 *
 * @param dot The DOT string to convert.
 * @param options Options for converting the DOT string to a model.
 * @returns A model of type {@link RootGraphModel}, {@link NodeModel}, {@link EdgeModel}, or {@link SubgraphModel},
 * depending on the type specified in the options.
 */
export function fromDot<const P extends Partial<ModelsContext>>(
  dot: string,
  options: FromDotOptions<'Dot' | 'Graph', P> & {
    convert: { models: P };
  },
): ResolvedModelTypes<P>['Graph'] | ResolvedModelTypes<P>['Digraph'];
export function fromDot<
  const P extends Partial<ModelsContext>,
  const R extends FromDotRule,
>(
  dot: string,
  options: FromDotOptions<R, P> & {
    convert: { models: P };
  },
): FromDotModel<R, ResolvedModelTypes<P>>;
export function fromDot(
  dot: string,
  options?: FromDotOptions<'Dot' | 'Graph'>,
): RootGraphModel;
export function fromDot<const R extends FromDotRule>(
  dot: string,
  options: FromDotOptions<R>,
): FromDotModel<R>;
export function fromDot(
  dot: string,
  options?: FromDotOptions<FromDotRule>,
): RootGraphModel | NodeModel | EdgeModel | SubgraphModel {
  return fromDotOf(dot, withOrderedOptions(options));
}

/**
 * `fromDotAll` with the classes of `orderedModels` for the kinds
 * `convert.models` leaves out, so the models keep the default attribute
 * statements of the source in their place.
 *
 * @group Convert DOT to Model
 *
 * @param dot The DOT source to convert.
 * @param options Parser limits and conversion options.
 * @returns The graphs, possibly none.
 */
export function fromDotAll<const P extends Partial<ModelsContext>>(
  dot: string,
  options: Omit<FromDotOptions<'Dot', P>, 'parse'> & {
    parse?: Omit<ParseOptions<'Dot'>, 'startRule'>;
    convert: { models: P };
  },
): (ResolvedModelTypes<P>['Graph'] | ResolvedModelTypes<P>['Digraph'])[];
export function fromDotAll(
  dot: string,
  options?: Omit<FromDotOptions<'Dot'>, 'parse'> & {
    parse?: Omit<ParseOptions<'Dot'>, 'startRule'>;
  },
): RootGraphModel[];
export function fromDotAll(
  dot: string,
  options?: Omit<FromDotOptions<'Dot'>, 'parse'> & {
    parse?: Omit<ParseOptions<'Dot'>, 'startRule'>;
  },
): RootGraphModel[] {
  return fromDotAllOf(dot, withOrderedOptions(options));
}
