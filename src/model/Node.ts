import { DotBase } from '../common';
import { IEdgeTarget } from '../common/interface';
import { Compass } from '../common/type';
import { commentOut, concatWordsWithColon, joinLines } from '../utils/dot-rendering';
import { Attributes } from './Attributes';
import { ID } from './ID';

// tslint:disable: max-classes-per-file

interface IPort {
  port: string;
  compass: Compass;
}

/**
 * Node object.
 * @category Primary
 */
export class Node extends DotBase implements IEdgeTarget {
  /** Comments to include when outputting with toDot. */
  public comment?: string;
  /** @hidden */
  public readonly idLiteral: ID;
  /** @hidden */
  public readonly attributes = new Attributes();
  constructor(public readonly id: string) {
    super();
    this.idLiteral = new ID(id);
  }

  /** Convert Node to Dot language. */
  public toDot(): string {
    const comment = this.comment ? commentOut(this.comment) : undefined;
    const target = this.idLiteral.toDot();
    const attrs = this.attributes.size > 0 ? ` ${this.attributes.toDot()}` : '';
    const dot = `${target}${attrs};`;
    return joinLines(comment, dot);
  }
  /** Converts a Node to an EdgeTarget. */
  public toEdgeTargetDot(): string {
    return this.idLiteral.toDot();
  }

  /** Returns NodeWithPort with port and compass specified. */
  public port(port: string | Partial<IPort>): NodeWithPort {
    if (typeof port === 'string') {
      return new NodeWithPort(this, { port });
    }
    return new NodeWithPort(this, port);
  }
}

/**
 * An object that represents a Node where port and compass are specified.
 * @category Primary
 */
export class NodeWithPort implements IEdgeTarget {
  /** Specify port embedded in Label. */
  public readonly port?: ID;
  /** Specify the direction of the edge. */
  public readonly compass?: Compass;
  constructor(public readonly node: Node, port: Partial<IPort>) {
    this.port = port.port ? new ID(port.port) : undefined;
    this.compass = port.compass;
  }

  /** Converts a NodeWithPort to an EdgeTarget. */
  public toEdgeTargetDot() {
    return concatWordsWithColon(this.node.idLiteral.toDot(), this.port?.toDot(), this.compass);
  }
}

/**
 * string or an object implementing IEdgeTarget.
 */
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
