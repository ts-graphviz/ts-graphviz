import {
  type AttributesGroupModel,
  type EdgeAttributeKey,
  type EdgeAttributesObject,
  type EdgeModel,
  type EdgeTargetTuple,
  isNodeRefLike,
} from '@ts-graphviz/common';
import { AttributesGroup } from './AttributesGroup.js';
import { DotObject } from './DotObject.js';

/**
 * DOT object class representing a edge.
 * @public
 */
export class Edge extends DotObject implements EdgeModel {
  public get $$type(): 'Edge' {
    return 'Edge';
  }

  public comment?: string;

  public readonly attributes: AttributesGroupModel<EdgeAttributeKey>;

  constructor(
    public readonly targets: EdgeTargetTuple,
    attributes?: EdgeAttributesObject,
  ) {
    super();
    if (
      targets.length < 2 &&
      (isNodeRefLike(targets[0]) && isNodeRefLike(targets[1])) === false
    ) {
      throw Error(
        'The element of Edge target is missing or not satisfied as Edge target.',
      );
    }
    this.attributes = new AttributesGroup(attributes);
  }
}
