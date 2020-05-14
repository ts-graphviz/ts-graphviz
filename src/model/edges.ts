import { DotObject } from './abstract';
import { attribute } from '../attribute';
import { EdgeTarget } from '../types';
import { Attributes } from './attributes-base';

/**
 * @category Primary
 */
export class Edge extends DotObject {
  /** Comments to include when outputting with toDot. */
  public comment?: string;
  // TODO
  public readonly attributes = new Attributes<attribute.Edge>();

  constructor(public readonly targets: EdgeTarget[]) {
    super();
  }
}
