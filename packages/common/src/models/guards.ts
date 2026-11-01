import { MODEL, modelOf } from './model-view.js';
import type { ForwardRefNode } from './models.js';
import type { NarrowedModel } from './readonly-models.js';

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
  // An object standing for a model (a ModelView) is not one: its `id` is not
  // the node's.
  return (
    typeof object === 'object' &&
    object !== null &&
    !(MODEL in object) &&
    typeof field(object, 'id') === 'string'
  );
}

/**
 * Type guard to check if an object is a NodeModel.
 *
 * Given a model, it keeps the caller's type: a union of models narrows to
 * its `Node` members. On a value of unknown type it narrows to the
 * read-only view {@link ReadonlyNodeModel} (or an object standing for
 * one, such as a DOT DSL, which also passes), since the check looks only at
 * `$$type` and a few fields (see {@link NarrowedModel}).
 * @param object - Object to check
 * @returns True if the object is a NodeModel
 */
export function isNodeModel<T>(object: T): object is NarrowedModel<T, 'Node'> {
  const model: unknown = modelOf(object);
  return (
    typeof model === 'object' &&
    model !== null &&
    field(model, '$$type') === 'Node' &&
    typeof field(model, 'id') === 'string'
  );
}

/**
 * Type guard to check if an object is an EdgeModel.
 *
 * Given a model, it keeps the caller's type: a union of models narrows to
 * its `Edge` members. On a value of unknown type it narrows to the
 * read-only view {@link ReadonlyEdgeModel} (or an object standing for
 * one, such as a DOT DSL, which also passes), since the check looks only at
 * `$$type` and a few fields (see {@link NarrowedModel}).
 * @param object - Object to check
 * @returns True if the object is an EdgeModel
 */
export function isEdgeModel<T>(object: T): object is NarrowedModel<T, 'Edge'> {
  const model: unknown = modelOf(object);
  return (
    typeof model === 'object' &&
    model !== null &&
    field(model, '$$type') === 'Edge' &&
    Array.isArray(field(model, 'targets'))
  );
}

/**
 * Type guard to check if an object is a SubgraphModel.
 *
 * Given a model, it keeps the caller's type: a union of models narrows to
 * its `Subgraph` members. On a value of unknown type it narrows to the
 * read-only view {@link ReadonlySubgraphModel} (or an object standing for
 * one, such as a DOT DSL, which also passes), since the check looks only at
 * `$$type` and a few fields (see {@link NarrowedModel}).
 * @param object - Object to check
 * @returns True if the object is a SubgraphModel
 */
export function isSubgraphModel<T>(
  object: T,
): object is NarrowedModel<T, 'Subgraph'> {
  const model: unknown = modelOf(object);
  return (
    typeof model === 'object' &&
    model !== null &&
    field(model, '$$type') === 'Subgraph'
  );
}

/**
 * Type guard to check if an object is a RootGraphModel.
 *
 * Given a model, it keeps the caller's type: a union of models narrows to
 * its `Graph` members. On a value of unknown type it narrows to the
 * read-only view {@link ReadonlyRootGraphModel} (or an object standing for
 * one, such as a DOT DSL, which also passes), since the check looks only at
 * `$$type` and a few fields (see {@link NarrowedModel}).
 * @param object - Object to check
 * @returns True if the object is a RootGraphModel
 */
export function isRootGraphModel<T>(
  object: T,
): object is NarrowedModel<T, 'Graph'> {
  const model: unknown = modelOf(object);
  return (
    typeof model === 'object' &&
    model !== null &&
    field(model, '$$type') === 'Graph' &&
    typeof field(model, 'directed') === 'boolean'
  );
}

/**
 * Type guard to check if an object is a DotModel.
 *
 * Given a model, it keeps the caller's type: a union of models narrows to
 * its `Dot` members. On a value of unknown type it narrows to the
 * read-only view {@link ReadonlyDotModel} (or an object standing for
 * one, such as a DOT DSL, which also passes), since the check looks only at
 * `$$type` and a few fields (see {@link NarrowedModel}).
 * @param object - Object to check
 * @returns True if the object is a DotModel
 */
export function isDotModel<T>(object: T): object is NarrowedModel<T, 'Dot'> {
  const model: unknown = modelOf(object);
  return (
    typeof model === 'object' &&
    model !== null &&
    field(model, '$$type') === 'Dot' &&
    Array.isArray(field(model, 'graphs'))
  );
}

/**
 * Type guard to check if an object is an AttributeListModel.
 *
 * Given a model, it keeps the caller's type: a union of models narrows to
 * its `AttributeList` members. On a value of unknown type it narrows to the
 * read-only view {@link ReadonlyAttributeListModel} (or an object standing for
 * one, such as a DOT DSL, which also passes), since the check looks only at
 * `$$type` and a few fields (see {@link NarrowedModel}).
 * @param object - Object to check
 * @returns True if the object is an AttributeListModel
 */
export function isAttributeListModel<T>(
  object: T,
): object is NarrowedModel<T, 'AttributeList'> {
  const model: unknown = modelOf(object);
  return (
    typeof model === 'object' &&
    model !== null &&
    field(model, '$$type') === 'AttributeList'
  );
}
