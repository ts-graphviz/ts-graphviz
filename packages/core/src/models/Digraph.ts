import type {
  AnyModelTypes,
  ModelsContext,
  ModelTypes,
} from '@ts-graphviz/common';
import { defaultModelsContext } from './models-context.js';
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
  protected override defaultModels(): ModelsContext {
    return defaultModelsContext();
  }
}
