import { DotBase } from '../common';
import { escape, quote } from '../utils/dot-rendering';
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
    const target = quote(escape(this.id));
    const attrs = this.attributes.size > 0 ? ` ${this.attributes.toDot()}` : '';
    return `${target}${attrs};`;
  }

  public port(port: string): NodeWithPort {
    return new NodeWithPort(this, port);
  }
}

// tslint:disable-next-line: max-classes-per-file
export class NodeWithPort {
  constructor(public readonly node: Node, public readonly port: string) {}
}

export type NodeLikeObject = Node | NodeWithPort;
export type NodeLike = NodeLikeObject | string;

export function isNodeLikeObject(node: any): node is NodeLikeObject {
  return node instanceof Node || node instanceof NodeWithPort;
}

export function isNodeLike(node: any): node is NodeLike {
  return typeof node === 'string' || isNodeLikeObject(node);
}
