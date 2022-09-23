import {
  GraphAttributesObject,
  RootGraphModel,
  SubgraphAttributesObject,
  SubgraphModel,
  NodeAttributesObject,
  NodeModel,
  EdgeTargetTuple,
  EdgeAttributesObject,
  EdgeModel,
} from './models.js';

/**
 * @beta
 */
export interface RootGraphConstructor {
  new (id?: string, attributes?: GraphAttributesObject): RootGraphModel;
  new (id?: string, strict?: boolean, attributes?: GraphAttributesObject): RootGraphModel;
  new (strict?: boolean, attributes?: GraphAttributesObject): RootGraphModel;
  new (attributes?: GraphAttributesObject): RootGraphModel;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): RootGraphModel;
}

/**
 * @beta
 */
export interface SubgraphConstructor {
  new (id?: string, attributes?: SubgraphAttributesObject): SubgraphModel;
  new (attributes?: SubgraphAttributesObject): SubgraphModel;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): SubgraphModel;
}

/**
 * @beta
 */
export interface NodeConstructor {
  new (id: string, attributes?: NodeAttributesObject): NodeModel;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): NodeModel;
}

/**
 * @beta
 */
export interface EdgeConstructor {
  new (targets: EdgeTargetTuple, attributes?: EdgeAttributesObject): EdgeModel;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): EdgeModel;
}

/**
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
 * @alpha
 */
export const RootModelsContext: ModelsContext = Object.seal({
  Graph: null,
  Digraph: null,
  Subgraph: null,
  Node: null,
  Edge: null,
} as unknown as ModelsContext);

/**
 * @alpha
 */
export function createModelsContext(models: Partial<ModelsContext>): ModelsContext {
  return Object.assign(Object.seal(Object.assign({}, RootModelsContext)), models);
}
