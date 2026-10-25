import type {
  AttributeListModel,
  DotModel,
  DotObjectModel,
  EdgeModel,
  ForwardRefNode,
  NodeModel,
  RootGraphModel,
  SubgraphModel,
} from './models.js';

/**
 * Type guard to check if an object is a ForwardRefNode
 * @param object - Object to check
 * @returns True if the object is a ForwardRefNode
 */
export function isForwardRefNode(object: unknown): object is ForwardRefNode {
  return (
    typeof object === 'object' &&
    object !== null &&
    typeof (object as ForwardRefNode).id === 'string'
  );
}

/**
 * Type guard to check if an object is a NodeModel
 * @param object - Object to check (can be unknown or DotObjectModel)
 * @returns True if the object is a NodeModel
 */
export function isNodeModel(object: unknown): object is NodeModel;
export function isNodeModel(model: DotObjectModel): model is NodeModel;
export function isNodeModel(object: unknown): object is NodeModel {
  return (
    typeof object === 'object' &&
    object !== null &&
    (object as NodeModel).$$type === 'Node' &&
    typeof (object as NodeModel).id === 'string'
  );
}

/**
 * Type guard to check if an object is an EdgeModel
 * @param object - Object to check (can be unknown or DotObjectModel)
 * @returns True if the object is an EdgeModel
 */
export function isEdgeModel(object: unknown): object is EdgeModel;
export function isEdgeModel(model: DotObjectModel): model is EdgeModel;
export function isEdgeModel(object: unknown): object is EdgeModel {
  return (
    typeof object === 'object' &&
    object !== null &&
    (object as EdgeModel).$$type === 'Edge' &&
    Array.isArray((object as EdgeModel).targets)
  );
}

/**
 * Type guard to check if an object is a SubgraphModel
 * @param object - Object to check (can be unknown or DotObjectModel)
 * @returns True if the object is a SubgraphModel
 */
export function isSubgraphModel(object: unknown): object is SubgraphModel;
export function isSubgraphModel(model: DotObjectModel): model is SubgraphModel;
export function isSubgraphModel(object: unknown): object is SubgraphModel {
  return (
    typeof object === 'object' &&
    object !== null &&
    (object as SubgraphModel).$$type === 'Subgraph'
  );
}

/**
 * Type guard to check if an object is a RootGraphModel
 * @param object - Object to check (can be unknown or DotObjectModel)
 * @returns True if the object is a RootGraphModel
 */
export function isRootGraphModel(object: unknown): object is RootGraphModel;
export function isRootGraphModel(
  model: DotObjectModel,
): model is RootGraphModel;
export function isRootGraphModel(object: unknown): object is RootGraphModel {
  return (
    typeof object === 'object' &&
    object !== null &&
    (object as RootGraphModel).$$type === 'Graph' &&
    typeof (object as RootGraphModel).directed === 'boolean'
  );
}

/**
 * Type guard to check if an object is a DotModel
 * @param object - Object to check (can be unknown or DotObjectModel)
 * @returns True if the object is a DotModel
 */
export function isDotModel(object: unknown): object is DotModel;
export function isDotModel(model: DotObjectModel): model is DotModel;
export function isDotModel(object: unknown): object is DotModel {
  return (
    typeof object === 'object' &&
    object !== null &&
    (object as DotModel).$$type === 'Dot' &&
    Array.isArray((object as DotModel).graphs)
  );
}

/**
 * Type guard to check if an object is an AttributeListModel
 * @param object - Object to check (can be unknown or DotObjectModel)
 * @returns True if the object is an AttributeListModel
 */
export function isAttributeListModel(
  object: unknown,
): object is AttributeListModel;
export function isAttributeListModel(
  model: DotObjectModel,
): model is AttributeListModel;
export function isAttributeListModel(
  object: unknown,
): object is AttributeListModel {
  return (
    typeof object === 'object' &&
    object !== null &&
    (object as AttributeListModel).$$type === 'AttributeList'
  );
}
