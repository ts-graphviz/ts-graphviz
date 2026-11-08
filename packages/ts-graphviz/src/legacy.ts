/**
 * The same API as `ts-graphviz`, with the deprecated models of
 * `legacyModels`: every default attribute statement (`node [...]`,
 * `edge [...]`, `graph [...]`) is merged into the graph's one set of
 * defaults, written first, as 3.x did. Import from here to keep the 3.x
 * output while moving to v4. Its factories and `fromDot` create the legacy
 * classes; the classes it exports under their own names (`Digraph`,
 * `Graph`, `Subgraph`, …) are v4's, so construct `LegacyDigraph`,
 * `LegacyGraph` or `LegacySubgraph` directly where a class is built by
 * hand.
 *
 * ```ts
 * import { digraph, toDot } from 'ts-graphviz/legacy';
 *
 * const G = digraph('G', (g) => {
 *   g.node('a');
 *   g.node({ color: 'blue' }); // a is blue too, as in 3.x
 * });
 * ```
 *
 * @deprecated v4's models keep a default attribute statement in its place,
 * as in DOT. Kept for code that relies on the 3.x behaviour; removed in v5.
 * @module ts-graphviz/legacy
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
import { legacyModels } from '@ts-graphviz/core';
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

/** `legacyModels`, with the classes of `models` where it gives one. */
function withLegacy(
  models: Partial<ModelsContext> | undefined,
): Partial<ModelsContext> {
  const merged: Record<string, unknown> = { ...legacyModels };
  for (const [key, model] of Object.entries(ownOptions(models))) {
    if (model !== undefined) merged[key] = model;
  }
  return merged as Partial<ModelsContext>;
}

/** The options, with `legacyModels` under the classes of `convert.models`. */
function withLegacyOptions<
  T extends { convert?: { models?: Partial<ModelsContext> } },
>(options: T | undefined): T {
  const own = ownOptions(options);
  const convert = ownOptions(own.convert);
  return {
    ...own,
    convert: { ...convert, models: withLegacy(convert.models) },
  } as T;
}

const legacy: ModelFactoriesWithStrict = withContextOf(legacyModels);

/**
 * A factory for directed graphs that merge every default attribute
 * statement into their leading defaults, as 3.x did (`legacyModels`).
 *
 * @deprecated v4's models keep a default attribute statement in its place,
 * as in DOT. Kept for code that relies on the 3.x behaviour; removed in v5.
 * @group Model Factory
 */
export const digraph: ModelFactory = legacy.digraph;

/**
 * A factory for undirected graphs that merge every default attribute
 * statement into their leading defaults, as 3.x did (`legacyModels`).
 *
 * @deprecated v4's models keep a default attribute statement in its place,
 * as in DOT. Kept for code that relies on the 3.x behaviour; removed in v5.
 * @group Model Factory
 */
export const graph: ModelFactory = legacy.graph;

/**
 * The factories of strict graphs that merge every default attribute
 * statement into their leading defaults, as 3.x did (`legacyModels`).
 *
 * @deprecated v4's models keep a default attribute statement in its place,
 * as in DOT. Kept for code that relies on the 3.x behaviour; removed in v5.
 * @group Model Factory
 */
export const strict: ModelFactories = legacy.strict;

/**
 * Factories with the given classes and, for the kinds it leaves out, those
 * of `legacyModels`.
 *
 * @param models - The classes to create the models from.
 * @returns The factories `digraph`, `graph` and `strict` of that context.
 * @deprecated v4's models keep a default attribute statement in its place,
 * as in DOT. Kept for code that relies on the 3.x behaviour; removed in v5.
 * @group Model Factory
 */
export function withContext<const P extends Partial<ModelsContext>>(
  models: P,
): ModelFactoriesWithStrict<ResolvedModelTypes<P>> {
  return withContextOf(withLegacy(models) as P);
}

// The signatures below are those of `ts-graphviz`; `pnpm api:check` fails
// if the API of `ts-graphviz/legacy` and that of `ts-graphviz` differ.

/**
 * `fromDot` with the classes of `legacyModels` for the kinds
 * `convert.models` leaves out, so the models merge the default attribute
 * statements of the source into one set of defaults, as 3.x did.
 *
 * @deprecated v4's models keep a default attribute statement in its place,
 * as in DOT. Kept for code that relies on the 3.x behaviour; removed in v5.
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
/** @deprecated The 3.x models (`legacyModels`); removed in v5. */
export function fromDot<
  const P extends Partial<ModelsContext>,
  const R extends FromDotRule,
>(
  dot: string,
  options: FromDotOptions<R, P> & {
    convert: { models: P };
  },
): FromDotModel<R, ResolvedModelTypes<P>>;
/** @deprecated The 3.x models (`legacyModels`); removed in v5. */
export function fromDot(
  dot: string,
  options?: FromDotOptions<'Dot' | 'Graph'>,
): RootGraphModel;
/** @deprecated The 3.x models (`legacyModels`); removed in v5. */
export function fromDot<const R extends FromDotRule>(
  dot: string,
  options: FromDotOptions<R>,
): FromDotModel<R>;
export function fromDot(
  dot: string,
  options?: FromDotOptions<FromDotRule>,
): RootGraphModel | NodeModel | EdgeModel | SubgraphModel {
  return fromDotOf(dot, withLegacyOptions(options));
}

/**
 * `fromDotAll` with the classes of `legacyModels` for the kinds
 * `convert.models` leaves out, so the models merge the default attribute
 * statements of the source into one set of defaults, as 3.x did.
 *
 * @deprecated v4's models keep a default attribute statement in its place,
 * as in DOT. Kept for code that relies on the 3.x behaviour; removed in v5.
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
/** @deprecated The 3.x models (`legacyModels`); removed in v5. */
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
  return fromDotAllOf(dot, withLegacyOptions(options));
}
