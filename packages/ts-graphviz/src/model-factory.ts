import type { ModelClasses, ResolvedModelTypes } from '@ts-graphviz/common';
import { createModelKit } from '@ts-graphviz/core';
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
 * withModelKit creates a {@link ModelFactoriesWithStrict} object whose
 * graphs, and everything created in them, come from the given classes and,
 * for the kinds left out, the default ones (see `createModelKit`).
 *
 * @param classes - The classes to create the models from.
 *
 * @returns An object with model factories ('digraph', 'graph', and 'strict') that create with that kit.
 * @group Model Factory
 */
export function withModelKit<const P extends Partial<ModelClasses>>(
  classes: P,
): ModelFactoriesWithStrict<ResolvedModelTypes<P>> {
  const kit = createModelKit(classes);
  return Object.freeze({
    ...createModelFactories(false, kit),
    strict: createModelFactories(true, kit),
  });
}
