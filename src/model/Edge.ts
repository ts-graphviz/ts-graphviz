import { DotBase } from '../abstract';
import { attribute } from '../attribute';
import { IEdgeTarget } from '../types';
import { Attributes } from './Attributes';

/**
 * @category Primary
 */
export class Edge extends DotBase {
  /** Comments to include when outputting with toDot. */
  public comment?: string;
  // TODO
  public readonly attributes = new Attributes<attribute.Edge>();

  constructor(public readonly targets: IEdgeTarget[]) {
    super();
  }
}
