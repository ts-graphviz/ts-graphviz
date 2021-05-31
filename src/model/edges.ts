import { EdgeAttributes, IAttributes, IEdge, EdgeTargetTuple } from '../types';
import { DotObject } from './abstract';
import { attribute } from '../attribute';
import { Attributes } from './attributes-base';
import { isNodeRefLike } from './nodes';

/**
 * @category Primary
 */
export class Edge extends DotObject implements IEdge {
  /** Comments to include when outputting with toDot. */
  public comment?: string;
  public readonly attributes: IAttributes<attribute.Edge>;

  constructor(public readonly targets: EdgeTargetTuple, attributes?: EdgeAttributes) {
    super();
    if (targets.length < 2 && (isNodeRefLike(targets[0]) && isNodeRefLike(targets[1])) === false) {
      throw Error('The element of Edge target is missing or not satisfied as Edge target.');
    }
    this.attributes = new Attributes<attribute.Edge>(attributes);
  }
}
