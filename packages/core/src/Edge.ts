import {
  type AttributesGroupModel,
  type EdgeAttributeKey,
  type EdgeAttributesObject,
  type EdgeModel,
  type EdgeTargetTuple,
  isNodeRefLike,
} from '@ts-graphviz/common';
import { AttributesGroup } from './AttributesGroup.js';

/**
 * DOT object class representing a edge.
 * @group Models
 */
export class Edge implements EdgeModel {
  public get $$type(): 'Edge' {
    return 'Edge';
  }

  public comment?: string;

  public readonly attributes: AttributesGroupModel<EdgeAttributeKey>;

  constructor(
    public readonly targets: EdgeTargetTuple,
    attributes?: EdgeAttributesObject,
  ) {
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
