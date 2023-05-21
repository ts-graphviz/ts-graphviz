import {
  AttributesGroupModel,
  EdgeAttributeKey,
  EdgeAttributesObject,
  EdgeModel,
  EdgeTargetTuple,
  define,
  isNodeRefLike,
} from '@ts-graphviz/common';
import { DotObject } from './DotObject.js';
import { AttributesGroup } from './AttributesGroup.js';

/**
 * DOT object class representing a edge.
 * @group Models
 */
@define({ type: 'Edge' })
export class Edge extends DotObject implements EdgeModel {
  public comment?: string;

  public readonly attributes: AttributesGroupModel<EdgeAttributeKey>;

  constructor(public readonly targets: EdgeTargetTuple, attributes?: EdgeAttributesObject) {
    super();
    if (targets.length < 2 && (isNodeRefLike(targets[0]) && isNodeRefLike(targets[1])) === false) {
      throw Error('The element of Edge target is missing or not satisfied as Edge target.');
    }
    this.attributes = new AttributesGroup(attributes);
  }
}
