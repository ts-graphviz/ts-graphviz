import type { EdgeAttributeKey } from '../attribute/index.js';
import { DotObject } from './abstract.js';
import { Attributes } from './attributes-base.js';
import { EdgeAttributesObject, EdgeTargetTuple, AttributeListModel, EdgeModel } from './types.js';
import { isNodeRefLike } from './nodes.js';

/**
 * @category Domain Model
 */
export class Edge extends DotObject implements EdgeModel {
  /** Comments to include when outputting with toDot. */
  public comment?: string;

  public readonly attributes: AttributeListModel<EdgeAttributeKey>;

  constructor(public readonly targets: EdgeTargetTuple, attributes?: EdgeAttributesObject) {
    super();
    if (targets.length < 2 && (isNodeRefLike(targets[0]) && isNodeRefLike(targets[1])) === false) {
      throw Error('The element of Edge target is missing or not satisfied as Edge target.');
    }
    this.attributes = new Attributes<EdgeAttributeKey>(attributes);
  }
}
