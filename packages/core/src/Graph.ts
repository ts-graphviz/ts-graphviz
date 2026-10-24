import type { ModelsContext } from '@ts-graphviz/common';
import { defaultModelsContext } from './models-context.js';
import { RootGraph } from './RootGraph.js';

/**
 * DOT object class representing a graph.
 * @group Models
 */
export class Graph extends RootGraph {
  get directed(): boolean {
    return false;
  }

  /** @hidden */
  protected override defaultModels(): ModelsContext {
    return defaultModelsContext();
  }
}
