import {
  EdgeTargetLike,
  EdgeTarget,
  INode,
  IPort,
  IForwardRefNode,
  INodeWithPort,
  NodeAttributes,
  IAttributes,
} from '../types';
import { DotObject } from './abstract';
import { attribute } from '../attribute';
import { Attributes } from './attributes-base';

/**
 * @category Primary
 * @hidden
 */
export class ForwardRefNode implements IForwardRefNode {
  constructor(public readonly id: string, public readonly port: Readonly<Partial<IPort>>) {}
}

/**
 * An object that represents a Node where port and compass are specified.
 * @category Primary
 */
export class NodeWithPort implements INodeWithPort {
  constructor(public readonly node: INode, public readonly port: Partial<IPort>) {}
}

/**
 * Node object.
 * @category Primary
 */
export class Node extends DotObject implements INode {
  /** Comments to include when outputting with toDot. */
  public comment?: string;
  public readonly attributes: IAttributes<attribute.Node>;
  constructor(public readonly id: string, attributes?: NodeAttributes) {
    super();
    this.attributes = new Attributes<attribute.Node>(attributes);
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
 * @hidden
 */
export function isEdgeTarget(node: unknown): node is EdgeTarget {
  return node instanceof Node || node instanceof NodeWithPort || node instanceof ForwardRefNode;
}

/**
 * @hidden
 */
export function isEdgeTargetLike(node: unknown): node is EdgeTargetLike {
  return typeof node === 'string' || isEdgeTarget(node);
}
