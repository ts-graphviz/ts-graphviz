import { GraphvizObject, IDot } from '../common';
import { NodeAttributes } from './attributes';
/**
 * @category Primary
 */
export class Node extends GraphvizObject implements IDot {
  constructor(public readonly id: string, public readonly attributes: NodeAttributes = new NodeAttributes()) {
    super();
  }

  public toDot(): string {
    throw new Error('Method not implemented.');
  }
}
