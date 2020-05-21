import { EdgeTarget, EdgeAttributes, IAttributes, EdgeTargets } from '../types';
import { DotObject } from './abstract';
import { attribute } from '../attribute';
import { Attributes } from './attributes-base';

/**
 * @category Primary
 */
export class Edge extends DotObject {
  /** Comments to include when outputting with toDot. */
  public comment?: string;
  public readonly attributes: IAttributes<attribute.Edge>;

  constructor(public readonly targets: ReadonlyArray<EdgeTarget | EdgeTargets>, attributes?: EdgeAttributes) {
    super();
    this.attributes = new Attributes<attribute.Edge>(attributes);
  }
}
