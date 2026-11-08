import {
  type AttributesGroupModel,
  type EdgeAttributeKey,
  type EdgeAttributesObject,
  type EdgeModel,
  type EdgeTargetTuple,
  type EmptySchema,
  isNodeRefLike,
  modelOf,
  type ReadonlyEdgeTargetTuple,
  type Schema,
  type SchemaAttributeTypes,
  withCode,
} from '@ts-graphviz/common';
import { AttributesBase } from '../attributes/AttributesBase.js';
import { AttributesView } from '../attributes/AttributesView.js';

/**
 * DOT object class representing a edge.
 *
 * @typeParam S - The schema of the models, which types the attributes;
 * none by default.
 * @group Models
 */
export class Edge<S extends Schema = EmptySchema>
  extends AttributesBase<EdgeAttributeKey, SchemaAttributeTypes<S, 'edge'>>
  implements EdgeModel<S>
{
  public get $$type(): 'Edge' {
    return 'Edge';
  }

  public comment?: string;

  #attributes?: AttributesView<
    EdgeAttributeKey,
    SchemaAttributeTypes<S, 'edge'>
  >;

  /**
   * A view of the edge's attributes: every method goes to the edge itself, so
   * `edge.attributes.set(...)` and `edge.setAttribute(...)` change the same
   * attributes.
   * @deprecated Call `getAttribute`, `setAttribute` and the others on the
   * edge. Removed in v5.
   */
  public get attributes(): AttributesGroupModel<
    EdgeAttributeKey,
    SchemaAttributeTypes<S, 'edge'>
  > {
    this.#attributes ??= new AttributesView(this);
    return this.#attributes;
  }

  public readonly targets: EdgeTargetTuple;

  constructor(
    targets: ReadonlyEdgeTargetTuple,
    attributes?: EdgeAttributesObject<S>,
  ) {
    super();
    // A copy, so the edge does not change with the caller's arrays; and the
    // nodes themselves, never objects standing for them (a DSL).
    const ts = targets.map((target) =>
      Array.isArray(target) ? target.map(modelOf) : modelOf(target),
    ) as EdgeTargetTuple;
    if (
      ts.length < 2 &&
      (isNodeRefLike(ts[0]) && isNodeRefLike(ts[1])) === false
    ) {
      throw withCode(
        new TypeError(
          'The element of Edge target is missing or not satisfied as Edge target.',
        ),
        'TSG_ERR_INVALID_EDGE_TARGETS',
      );
    }
    this.targets = ts;
    // Once the targets are checked and set, for an overridden `setAttribute`.
    if (attributes !== undefined) this.setAttributes(attributes);
  }
}
