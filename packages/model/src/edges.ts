import { DotObject } from './abstract';
import { EdgeAttributeKey } from '@ts-graphviz/dot-attribute';
import { Attributes } from './attributes-base';
import { EdgeAttributes, EdgeTargetTuple, IAttributes, IEdge } from './types';
import { isNodeRefLike } from './nodes';

/**
 * @category Domain Model
 */
export class Edge extends DotObject implements IEdge {
  /** Comments to include when outputting with toDot. */
  public comment?: string;

  public readonly attributes: IAttributes<EdgeAttributeKey>;

  constructor(public readonly targets: EdgeTargetTuple, attributes?: EdgeAttributes) {
    super();
    if (targets.length < 2 && (isNodeRefLike(targets[0]) && isNodeRefLike(targets[1])) === false) {
      throw Error('The element of Edge target is missing or not satisfied as Edge target.');
    }
    this.attributes = new Attributes<EdgeAttributeKey>(attributes);
  }
}
