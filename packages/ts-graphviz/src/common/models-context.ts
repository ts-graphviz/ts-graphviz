import {
  EdgeConstructor,
  NodeConstructor,
  RootGraphConstructor,
  SubgraphConstructor,
} from './models.js';

/**
 * @group Models Context
 * @beta
 */
export interface ModelsContext {
  Graph: RootGraphConstructor;
  Digraph: RootGraphConstructor;
  Subgraph: SubgraphConstructor;
  Node: NodeConstructor;
  Edge: EdgeConstructor;
}

/**
 * @group Models Context
 * @alpha
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
 * @alpha
 */
export function createModelsContext(
  models: Partial<ModelsContext>,
): ModelsContext {
  return Object.assign(
    Object.seal(Object.assign({}, RootModelsContext)),
    models,
  );
}
