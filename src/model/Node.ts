import { DotBase } from '../common';
import { IEdgeTarget } from '../common/interface';
import { Attributes } from './attributes';
import { Literal } from './Literal';

/**
 * @category Primary
 */
export class Node extends DotBase implements IEdgeTarget {
  public readonly idLiteral: Literal;
  public readonly attributes = new Attributes();
  constructor(public readonly id: string) {
    super();
    this.idLiteral = new Literal(id);
  }

  public toDot(): string {
    const target = this.idLiteral.toDot();
    const attrs = this.attributes.size > 0 ? ` ${this.attributes.toDot()}` : '';
    return `${target}${attrs};`;
  }

  public toEdgeTargetDot() {
    return this.idLiteral.toDot();
  }

  public port(port: string): NodeWithPort {
    return new NodeWithPort(this, port);
  }
}

// tslint:disable-next-line: max-classes-per-file
export class NodeWithPort implements IEdgeTarget {
  public readonly port: Literal;
  constructor(public readonly node: Node, port: string) {
    this.port = new Literal(port);
  }

  public toEdgeTargetDot() {
    return `${this.node.idLiteral.toDot()}:${this.port.toDot()}`;
  }
}

export type EdgeTargetLike = IEdgeTarget | string;

/**
 * @hidden
 */
export function isEdgeTarget(node: any): node is IEdgeTarget {
  return node instanceof Node || node instanceof NodeWithPort;
}

/**
 * @hidden
 */
export function isEdgeTargetLike(node: any): node is EdgeTargetLike {
  return typeof node === 'string' || isEdgeTarget(node);
}
