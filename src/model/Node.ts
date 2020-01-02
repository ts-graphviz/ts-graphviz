import { DotBase } from '../common';
import { IEdgeTarget } from '../common/interface';
import { commentOut, concatWordsWithColon, joinLines } from '../utils/dot-rendering';
import { Attributes } from './Attributes';
import { Literal } from './Literal';

type Compass = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' | 'c';

interface IPort {
  port: string;
  compass: Compass | string;
}

/**
 * @category Primary
 */
export class Node extends DotBase implements IEdgeTarget {
  public comment?: string;
  public readonly idLiteral: Literal;
  public readonly attributes = new Attributes();
  constructor(public readonly id: string) {
    super();
    this.idLiteral = new Literal(id);
  }

  public toDot(): string {
    const comment = this.comment ? commentOut(this.comment) : undefined;
    const target = this.idLiteral.toDot();
    const attrs = this.attributes.size > 0 ? ` ${this.attributes.toDot()}` : '';
    const dot = `${target}${attrs};`;
    return joinLines(comment, dot);
  }

  public toEdgeTargetDot() {
    return this.idLiteral.toDot();
  }

  public port(port: string | Partial<IPort>): NodeWithPort {
    if (typeof port === 'string') {
      return new NodeWithPort(this, { port });
    }
    return new NodeWithPort(this, port);
  }
}

// tslint:disable-next-line: max-classes-per-file
export class NodeWithPort implements IEdgeTarget {
  public readonly port?: Literal;
  public readonly compass?: Compass | string;
  constructor(public readonly node: Node, port: Partial<IPort>) {
    this.port = port.port ? new Literal(port.port) : undefined;
    this.compass = port.compass;
  }

  public toEdgeTargetDot() {
    return concatWordsWithColon(this.node.idLiteral.toDot(), this.port?.toDot(), this.compass);
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
