import type {
  AnyDotObjectModel,
  AttributeListModel,
  DotModel,
  DotObjectModel,
  EdgeModel,
  ForwardRefNode,
  NodeModel,
  RootGraphModel,
  SubgraphModel,
} from './models.js';
import type {
  AnyReadonlyDotObjectModel,
  ReadonlyAttributeListModel,
  ReadonlyDotModel,
  ReadonlyEdgeModel,
  ReadonlyNodeModel,
  ReadonlyRootGraphModel,
  ReadonlySubgraphModel,
} from './readonly-models.js';

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
 * Type guard to check if an object is a NodeModel.
 *
 * Given a model, it keeps the caller's type: a union of models narrows to
 * its `Node` members. On a value of another type it narrows to the
 * read-only view {@link ReadonlyNodeModel}, since the check looks only at
 * `$$type` and a few fields.
 * @param object - Object to check
 * @returns True if the object is a NodeModel
 */
export function isNodeModel<T extends AnyReadonlyDotObjectModel>(
  model: T,
): model is Extract<T, DotObjectModel<'Node'>>;
export function isNodeModel(object: unknown): object is ReadonlyNodeModel;
/** For inference, e.g. `models.filter(isNodeModel)` on built-in models. */
export function isNodeModel(model: AnyDotObjectModel): model is NodeModel;
export function isNodeModel(object: unknown): boolean {
  return (
    typeof object === 'object' &&
    object !== null &&
    field(object, '$$type') === 'Node' &&
    typeof field(object, 'id') === 'string'
  );
}

/**
 * Type guard to check if an object is an EdgeModel.
 *
 * Given a model, it keeps the caller's type: a union of models narrows to
 * its `Edge` members. On a value of another type it narrows to the
 * read-only view {@link ReadonlyEdgeModel}, since the check looks only at
 * `$$type` and a few fields.
 * @param object - Object to check
 * @returns True if the object is an EdgeModel
 */
export function isEdgeModel<T extends AnyReadonlyDotObjectModel>(
  model: T,
): model is Extract<T, DotObjectModel<'Edge'>>;
export function isEdgeModel(object: unknown): object is ReadonlyEdgeModel;
/** For inference, e.g. `models.filter(isEdgeModel)` on built-in models. */
export function isEdgeModel(model: AnyDotObjectModel): model is EdgeModel;
export function isEdgeModel(object: unknown): boolean {
  return (
    typeof object === 'object' &&
    object !== null &&
    field(object, '$$type') === 'Edge' &&
    Array.isArray(field(object, 'targets'))
  );
}

/**
 * Type guard to check if an object is a SubgraphModel.
 *
 * Given a model, it keeps the caller's type: a union of models narrows to
 * its `Subgraph` members. On a value of another type it narrows to the
 * read-only view {@link ReadonlySubgraphModel}, since the check looks only at
 * `$$type` and a few fields.
 * @param object - Object to check
 * @returns True if the object is a SubgraphModel
 */
export function isSubgraphModel<T extends AnyReadonlyDotObjectModel>(
  model: T,
): model is Extract<T, DotObjectModel<'Subgraph'>>;
export function isSubgraphModel(
  object: unknown,
): object is ReadonlySubgraphModel;
/** For inference, e.g. `models.filter(isSubgraphModel)` on built-in models. */
export function isSubgraphModel(
  model: AnyDotObjectModel,
): model is SubgraphModel;
export function isSubgraphModel(object: unknown): boolean {
  return (
    typeof object === 'object' &&
    object !== null &&
    field(object, '$$type') === 'Subgraph'
  );
}

/**
 * Type guard to check if an object is a RootGraphModel.
 *
 * Given a model, it keeps the caller's type: a union of models narrows to
 * its `Graph` members. On a value of another type it narrows to the
 * read-only view {@link ReadonlyRootGraphModel}, since the check looks only at
 * `$$type` and a few fields.
 * @param object - Object to check
 * @returns True if the object is a RootGraphModel
 */
export function isRootGraphModel<T extends AnyReadonlyDotObjectModel>(
  model: T,
): model is Extract<T, DotObjectModel<'Graph'>>;
export function isRootGraphModel(
  object: unknown,
): object is ReadonlyRootGraphModel;
/** For inference, e.g. `models.filter(isRootGraphModel)` on built-in models. */
export function isRootGraphModel(
  model: AnyDotObjectModel,
): model is RootGraphModel;
export function isRootGraphModel(object: unknown): boolean {
  return (
    typeof object === 'object' &&
    object !== null &&
    field(object, '$$type') === 'Graph' &&
    typeof field(object, 'directed') === 'boolean'
  );
}

/**
 * Type guard to check if an object is a DotModel.
 *
 * Given a model, it keeps the caller's type: a union of models narrows to
 * its `Dot` members. On a value of another type it narrows to the
 * read-only view {@link ReadonlyDotModel}, since the check looks only at
 * `$$type` and a few fields.
 * @param object - Object to check
 * @returns True if the object is a DotModel
 */
export function isDotModel<T extends AnyReadonlyDotObjectModel>(
  model: T,
): model is Extract<T, DotObjectModel<'Dot'>>;
export function isDotModel(object: unknown): object is ReadonlyDotModel;
/** For inference, e.g. `models.filter(isDotModel)` on built-in models. */
export function isDotModel(model: AnyDotObjectModel): model is DotModel;
export function isDotModel(object: unknown): boolean {
  return (
    typeof object === 'object' &&
    object !== null &&
    field(object, '$$type') === 'Dot' &&
    Array.isArray(field(object, 'graphs'))
  );
}

/**
 * Type guard to check if an object is an AttributeListModel.
 *
 * Given a model, it keeps the caller's type: a union of models narrows to
 * its `AttributeList` members. On a value of another type it narrows to the
 * read-only view {@link ReadonlyAttributeListModel}, since the check looks only at
 * `$$type` and a few fields.
 * @param object - Object to check
 * @returns True if the object is an AttributeListModel
 */
export function isAttributeListModel<T extends AnyReadonlyDotObjectModel>(
  model: T,
): model is Extract<T, DotObjectModel<'AttributeList'>>;
export function isAttributeListModel(
  object: unknown,
): object is ReadonlyAttributeListModel;
/** For inference, e.g. `models.filter(isAttributeListModel)` on built-in models. */
export function isAttributeListModel(
  model: AnyDotObjectModel,
): model is AttributeListModel;
export function isAttributeListModel(object: unknown): boolean {
  return (
    typeof object === 'object' &&
    object !== null &&
    field(object, '$$type') === 'AttributeList'
  );
}
