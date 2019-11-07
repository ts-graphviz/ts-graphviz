import { GraphvizObject, IDot } from '../common';
import { EdgeAttributes } from './attributes';
import { Node } from './Node';
/**
 * @category Primary
 */
export class Edge extends GraphvizObject implements IDot {
  constructor(
    public readonly from: Node,
    public readonly to: Node,
    public readonly attributes: EdgeAttributes = new EdgeAttributes(),
  ) {
    super();
  }
  public toDot(): string {
    throw new Error('Method not implemented.');
  }
}
