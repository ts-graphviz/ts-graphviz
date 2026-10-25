import type { ModelsContext, ResolvedModelTypes } from '@ts-graphviz/common';
import { createModelsContext } from '@ts-graphviz/core';
import { createModelFactories } from './model-factory-builder.js';
import type {
  ModelFactories,
  ModelFactoriesWithStrict,
  ModelFactory,
} from './types.js';

const noStrict: ModelFactories = createModelFactories(false);

/**
 *  digraph is a factory for creating Digraph objects.
 * @group Model Factory
 */
export const digraph: ModelFactory = noStrict.digraph;

/**
 * graph is a factory for creating Graph objects.
 * @group Model Factory
 */
export const graph: ModelFactory = noStrict.graph;

/**
 * Provides a strict mode API.
 * @group Model Factory
 */
export const strict: ModelFactories = createModelFactories(true);

/**
 * withContext creates a {@link ModelFactoriesWithStrict} object with the given context.
 *
 * @param models - An object containing the models to be used in the context.
 *
 * @returns An object with model factories ('digraph', 'graph', and 'strict') that operate within the given context.
 * @group Model Factory
 */
export function withContext<const P extends Partial<ModelsContext>>(
  models: P,
): ModelFactoriesWithStrict<ResolvedModelTypes<P>> {
  const context = createModelsContext(models);
  return Object.freeze({
    ...createModelFactories(false, context),
    strict: createModelFactories(true, context),
  });
}
