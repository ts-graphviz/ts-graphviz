import {
  type AttributesGroupModel,
  type EdgeAttributeKey,
  type EdgeAttributesObject,
  type EdgeModel,
  type EdgeTargetTuple,
  isNodeRefLike,
  type ReadonlyEdgeTargetTuple,
  withCode,
} from '@ts-graphviz/common';
import { AttributesGroup } from '../attributes/AttributesGroup.js';
import { DotObject } from './DotObject.js';

/**
 * DOT object class representing a edge.
 * @group Models
 */
export class Edge extends DotObject implements EdgeModel {
  public get $$type(): 'Edge' {
    return 'Edge';
  }

  public comment?: string;

  public readonly attributes: AttributesGroupModel<EdgeAttributeKey>;

  public readonly targets: EdgeTargetTuple;

  constructor(
    targets: ReadonlyEdgeTargetTuple,
    attributes?: EdgeAttributesObject,
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
    this.attributes = new AttributesGroup(attributes);
  }
}
