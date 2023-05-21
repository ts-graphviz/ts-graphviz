import { EdgeModel, NodeModel, RootGraphModel, SubgraphModel } from './models.js';

/**
 * @group Models Context
 */
export interface ModelsContext {
  Graph: RootGraphModel.Constructor;
  Digraph: RootGraphModel.Constructor;
  Subgraph: SubgraphModel.Constructor;
  Node: NodeModel.Constructor;
  Edge: EdgeModel.Constructor;
}

/**
 * @group Models Context
 */
export const RootModelsContext: ModelsContext = Object.seal({
  // NOTE: RootModelsContext is also initialized after the model class is declared in the 'core/index.js' module.
  Graph: null,
  Digraph: null,
  Subgraph: null,
  Node: null,
  Edge: null,
} as unknown as ModelsContext);

/**
 * @group Models Context
 */
export function createModelsContext(models: Partial<ModelsContext>): ModelsContext {
  return Object.assign(Object.seal(Object.assign({}, RootModelsContext)), models);
}
