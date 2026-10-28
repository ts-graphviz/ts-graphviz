import {
  type AttributesGroupModel,
  type EdgeAttributeKey,
  type EdgeAttributesObject,
  type EdgeModel,
  type EdgeTargetTuple,
  type EmptySchema,
  isNodeRefLike,
  type ReadonlyEdgeTargetTuple,
  type Schema,
  type SchemaAttributeTypes,
  withCode,
} from '@ts-graphviz/common';
import { AttributesGroup } from '../attributes/AttributesGroup.js';
import { DotObject } from './DotObject.js';

/**
 * DOT object class representing a edge.
 *
 * @typeParam S - The schema of the models, which types the attributes;
 * none by default.
 * @group Models
 */
export class Edge<S extends Schema = EmptySchema>
  extends DotObject
  implements EdgeModel<S>
{
  public get $$type(): 'Edge' {
    return 'Edge';
  }

  public comment?: string;

  public readonly attributes: AttributesGroupModel<
    EdgeAttributeKey,
    SchemaAttributeTypes<S, 'edge'>
  >;

  public readonly targets: EdgeTargetTuple;

  constructor(
    targets: ReadonlyEdgeTargetTuple,
    attributes?: EdgeAttributesObject<S>,
  ) {
    super();
    if (
      targets.length < 2 &&
      (isNodeRefLike(targets[0]) && isNodeRefLike(targets[1])) === false
    ) {
      throw withCode(
        new TypeError(
          'The element of Edge target is missing or not satisfied as Edge target.',
        ),
        'TSG_ERR_INVALID_EDGE_TARGETS',
      );
    }
    // A copy, so the edge does not change with the caller's arrays.
    this.targets = targets.map((target) =>
      Array.isArray(target) ? [...target] : target,
    ) as EdgeTargetTuple;
    this.attributes = new AttributesGroup<
      EdgeAttributeKey,
      SchemaAttributeTypes<S, 'edge'>
    >(attributes);
  }
}
