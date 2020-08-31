import { EdgeTarget, EdgeAttributes, IAttributes, EdgeTargets } from '../types';
import { DotObject } from './abstract';
import { attribute } from '../attribute';
import { Attributes } from './attributes-base';
import { isEdgeTargetLike } from './nodes';

/**
 * @category Primary
 */
export class Edge extends DotObject {
  /** Comments to include when outputting with toDot. */
  public comment?: string;
  public readonly attributes: IAttributes<attribute.Edge>;

  constructor(public readonly targets: ReadonlyArray<EdgeTarget | EdgeTargets>, attributes?: EdgeAttributes) {
    super();
    if (targets.length < 2 && (isEdgeTargetLike(targets[0]) && isEdgeTargetLike(targets[1])) === false) {
      throw Error('The element of Edge target is missing or not satisfied as Edge target.');
    }
    this.attributes = new Attributes<attribute.Edge>(attributes);
  }
}
