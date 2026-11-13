import type {
  AnyModelTypes,
  ModelClasses,
  ModelTypes,
} from '@ts-graphviz/common';
import { lazyDefaultModelKit } from './default-model-kit.js';
import { RootGraph } from './RootGraph.js';

/**
 * DOT object class representing a digraph.
 *
 * @typeParam M - The model types the graph creates; their schema types
 * the attributes.
 * @group Models
 */
export class Digraph<
  M extends AnyModelTypes = ModelTypes,
> extends RootGraph<M> {
  public get directed(): boolean {
    return true;
  }

  /** @hidden */
  protected override defaultModels(): ModelClasses {
    return lazyDefaultModelKit();
  }
}
