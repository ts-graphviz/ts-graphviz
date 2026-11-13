import type {
  AnyModelTypes,
  ModelClasses,
  ModelTypes,
} from '@ts-graphviz/common';
import { lazyDefaultModelKit } from './default-model-kit.js';
import { RootGraph } from './RootGraph.js';

/**
 * DOT object class representing a graph.
 *
 * @typeParam M - The model types the graph creates; their schema types
 * the attributes.
 * @group Models
 */
export class Graph<M extends AnyModelTypes = ModelTypes> extends RootGraph<M> {
  get directed(): boolean {
    return false;
  }

  /** @hidden */
  protected override defaultModels(): ModelClasses {
    return lazyDefaultModelKit();
  }
}
