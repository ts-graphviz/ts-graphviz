import type { ModelsContext } from '@ts-graphviz/common';
import { defaultModelsContext } from './models-context.js';
import { RootGraph } from './RootGraph.js';

/**
 * DOT object class representing a digraph.
 * @group Models
 */
export class Digraph extends RootGraph {
  public get directed(): boolean {
    return true;
  }

  /** @hidden */
  protected override defaultModels(): ModelsContext {
    return defaultModelsContext();
  }
}
