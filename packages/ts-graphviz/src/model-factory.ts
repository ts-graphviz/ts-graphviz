import { ModelsContext, createModelsContext } from '@ts-graphviz/common';
import { createModelFactories } from './model-factory-builder.js';
import { ModelFactories, ModelFactoriesWithStrict } from './types.js';

const noStrict: ModelFactories = createModelFactories(false);

/**
 *  digraph is a factory for creating Digraph objects.
 * @group Model Factory
 */
export const digraph = noStrict.digraph;

/**
 * graph is a factory for creating Graph objects.
 * @group Model Factory
 */
export const graph = noStrict.graph;

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
 * @returns A ModelFactoriesWithStrict object containing the factories. * @group Model Factory
 */
export function withContext(
  models: Partial<ModelsContext>,
): ModelFactoriesWithStrict {
  const context = createModelsContext(models);
  return Object.freeze({
    ...createModelFactories(false, context),
    strict: createModelFactories(true, context),
  });
}
