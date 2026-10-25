import type { ModelsContext, ResolvedModelTypes } from '@ts-graphviz/common';
import { Digraph } from './Digraph.js';
import { Dot } from './Dot.js';
import { Edge } from './Edge.js';
import { Graph } from './Graph.js';
import { Node } from './Node.js';
import { Subgraph } from './Subgraph.js';

let defaults: ModelsContext | undefined;

/**
 * The model classes of `@ts-graphviz/core` as a {@link ModelsContext}.
 *
 * The object is built on first use (the classes import this module in a
 * cycle, so it cannot be built while the modules are being evaluated) and
 * is frozen.
 *
 * @group Models Context
 */
export function defaultModelsContext(): ModelsContext {
  defaults ??= Object.freeze({ Dot, Graph, Digraph, Subgraph, Node, Edge });
  return defaults;
}

/**
 * Create a {@link ModelsContext} that uses the given classes and falls back
 * to the default ones for the rest.
 *
 * @group Models Context
 */
export function createModelsContext<
  const P extends Partial<ModelsContext> = Record<never, never>,
>(models: P = {} as P): ModelsContext<ResolvedModelTypes<P>> {
  const context = { ...defaultModelsContext() };
  for (const key of Object.keys(models) as (keyof ModelsContext)[]) {
    const model = models[key];
    if (model !== undefined) {
      // Partial<ModelsContext> values are unions of the constructor types;
      // the key picks the matching slot.
      (context as Record<keyof ModelsContext, unknown>)[key] = model;
    }
  }
  // The classes in `models` decide the instance types (#1736).
  return Object.freeze(context) as ModelsContext<ResolvedModelTypes<P>>;
}
