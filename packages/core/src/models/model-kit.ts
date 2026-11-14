import type {
  ModelClasses,
  ModelKit,
  ResolvedModelTypes,
} from '@ts-graphviz/common';
import { lazyDefaultModelKit, modelKitOf } from './default-model-kit.js';

const MODEL_KEYS = [
  'Dot',
  'Graph',
  'Digraph',
  'Subgraph',
  'Node',
  'Edge',
] as const satisfies readonly (keyof ModelClasses)[];

/**
 * The {@link ModelKit} of the model classes of `@ts-graphviz/core`.
 *
 * It is frozen.
 *
 * @group Model Kit
 */
export const defaultModelKit: ModelKit = lazyDefaultModelKit();

/**
 * Create a {@link ModelKit} that uses the given classes and those of
 * {@link defaultModelKit} for the rest. The kit is frozen.
 *
 * Custom classes are the way to extend what a kit creates: work to do on
 * every creation goes in the constructor of the class.
 *
 * @param classes - The classes to create the models from.
 * @group Model Kit
 */
export function createModelKit<
  const P extends Partial<ModelClasses> = Record<never, never>,
>(classes: P = {} as P): ModelKit<ResolvedModelTypes<P>> {
  const merged: ModelClasses = { ...pick(defaultModelKit) };
  // Own properties only: a class inherited from Object.prototype is never
  // taken for a model.
  const given = Object.assign(
    Object.create(null) as Partial<ModelClasses>,
    classes,
  );
  for (const key of MODEL_KEYS) {
    const model = given[key];
    if (model !== undefined) {
      // Partial<ModelClasses> values are unions of the constructor types;
      // the key picks the matching slot.
      (merged as Record<keyof ModelClasses, unknown>)[key] = model;
    }
  }
  // The classes in `classes` decide the instance types.
  return modelKitOf(merged) as ModelKit<ResolvedModelTypes<P>>;
}

function pick(kit: ModelKit): ModelClasses {
  const { Dot, Graph, Digraph, Subgraph, Node, Edge } = kit;
  return { Dot, Graph, Digraph, Subgraph, Node, Edge };
}
