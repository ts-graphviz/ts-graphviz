import { DotBase } from '../common';
import { NodeAttributes } from './attributes';

/**
 * @category Primary
 */
export class Node extends DotBase {
  public readonly attributes: NodeAttributes = new NodeAttributes();
  constructor(public readonly id: string) {
    super();
  }

  public toDot(): string {
    const target = Node.quoteString(this.id);
    const attrs = this.attributes.size > 0 ? ` ${this.attributes.toDot()}` : '';
    return `${target}${attrs};`;
  }
}
