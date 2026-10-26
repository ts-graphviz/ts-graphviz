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
 * A field of a model or node reference: from the object or the classes it
 * comes from, never from Object.prototype, so a plain object does not pass
 * for a model because of an inherited `$$type`, `id`, `targets` or
 * `directed`.
 */
function field(object: object, key: string): unknown {
  for (
    let o: object | null = object;
    o !== null && o !== Object.prototype;
    o = Object.getPrototypeOf(o)
  ) {
    if (Object.getOwnPropertyDescriptor(o, key) !== undefined) {
      return Reflect.get(object, key);
    }
  }
  return undefined;
}

/**
 * Type guard to check if an object is a ForwardRefNode
 * @param object - Object to check
 * @returns True if the object is a ForwardRefNode
 */
export function isForwardRefNode(object: unknown): object is ForwardRefNode {
  return (
    typeof object === 'object' &&
    object !== null &&
    typeof field(object, 'id') === 'string'
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
    field(object, '$$type') === 'Node' &&
    typeof field(object, 'id') === 'string'
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
    field(object, '$$type') === 'Edge' &&
    Array.isArray(field(object, 'targets'))
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
    field(object, '$$type') === 'Subgraph'
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
    field(object, '$$type') === 'Graph' &&
    typeof field(object, 'directed') === 'boolean'
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
    field(object, '$$type') === 'Dot' &&
    Array.isArray(field(object, 'graphs'))
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
    field(object, '$$type') === 'AttributeList'
  );
}
