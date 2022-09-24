import { createModelsContext, ModelsContext } from '#lib/common';
import { createModelFactories } from './model-factory-builder.js';
import { ModelFactories, ModelFactoriesWithStrict } from './types.js';

export const noStrict: ModelFactories = createModelFactories(false);

/**
 * API for creating directional graph objects.
 * @group Model Factory
 */
export const digraph = noStrict.digraph;

/**
 * API for creating omnidirectional graph objects.
 * @group Model Factory
 */
export const graph = noStrict.graph;

/**
 * Provides a strict mode API.
 * @group Model Factory
 */
export const strict: ModelFactories = createModelFactories(true);

/**
 * @group Model Factory
 */
export function withContext(models: Partial<ModelsContext>): ModelFactoriesWithStrict {
  const context = createModelsContext(models);
  return Object.freeze({
    ...createModelFactories(false, context),
    strict: createModelFactories(true, context),
  });
}
