import {
  type ModelKit,
  type ModelKitOptions,
  ownOptions,
} from '@ts-graphviz/common';
import { createModelKit, legacyModels } from '@ts-graphviz/core';

/**
 * The kits of `ts-graphviz/legacy`. A DSL and `fromDot` with one of them
 * work as in 3.x: a node or a subgraph declared again adds to the first one
 * with its id. Removed in v5 with `ts-graphviz/legacy`.
 */
const legacyKits = new WeakSet<ModelKit>();

/** Whether the kit is one of `ts-graphviz/legacy`. */
export function isLegacyKit(kit: ModelKit): boolean {
  return legacyKits.has(kit);
}

/**
 * The kit of `ts-graphviz/legacy` for the classes: those given, and those
 * of `legacyModels` for the kinds left out.
 */
export function createLegacyKit(
  classes: ModelKitOptions | undefined,
): ModelKit {
  const merged: Record<string, unknown> = { ...legacyModels };
  for (const [key, model] of Object.entries(ownOptions(classes))) {
    if (model !== undefined) merged[key] = model;
  }
  const kit = createModelKit(merged as ModelKitOptions);
  legacyKits.add(kit);
  return kit;
}
