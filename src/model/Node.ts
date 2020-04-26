import { DotBase } from '../abstract';
import { attribute } from '../attribute';
import { Compass, EdgeTargetLike, IEdgeTarget, INode, INodeWithPort, IPort } from '../types';
import { commentOut, concatWordsWithColon, joinLines } from '../utils/dot-rendering';
import { Attributes } from './Attributes';
import { ID } from './ID';

// tslint:disable: max-classes-per-file

/**
 * Node object.
 * @category Primary
 */
export class Node extends DotBase implements INode {
  /** Comments to include when outputting with toDot. */
  public comment?: string;
  public readonly attributes = new Attributes<attribute.Node>();
  /** @hidden */
  private readonly idLiteral: ID;
  constructor(public readonly id: string) {
    super();
    this.idLiteral = new ID(id);
  }

  /** Convert Node to Dot language. */
  public toDot(): string {
    const comment = this.comment ? commentOut(this.comment) : undefined;
    const target = this.toEdgeTargetDot();
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
export class NodeWithPort implements INodeWithPort {
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
    return concatWordsWithColon(this.node.toEdgeTargetDot(), this.port?.toDot(), this.compass);
  }
}

/**
 * @category Primary
 * @hidden
 */
export class ForwardRefNode implements INodeWithPort {
  public readonly id: ID;
  public readonly port?: ID;
  /** Specify the direction of the edge. */
  public readonly compass?: Compass;
  constructor(id: string, port: Partial<IPort>) {
    this.id = new ID(id);
    this.port = port.port ? new ID(port.port) : undefined;
    this.compass = port.compass;
  }

  /** Converts a NodeWithPort to an EdgeTarget. */
  public toEdgeTargetDot() {
    return concatWordsWithColon(this.id.toDot(), this.port?.toDot(), this.compass);
  }
}

/**
 * @hidden
 */
export function isEdgeTarget(node: any): node is IEdgeTarget {
  return node instanceof Node || node instanceof NodeWithPort || node instanceof ForwardRefNode;
}

/**
 * @hidden
 */
export function isEdgeTargetLike(node: any): node is EdgeTargetLike {
  return typeof node === 'string' || isEdgeTarget(node);
}
