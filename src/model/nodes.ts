import { NodeRefLike, NodeRef, INode, IPort, IForwardRefNode, NodeAttributes, IAttributes } from '../types';
import { DotObject } from './abstract';
import { attribute } from '../attribute';
import { Attributes } from './attributes-base';
import { NodeRefGroupLike } from '../types';

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

  /** Returns ForwardRefNode with port and compass specified. */
  public port(port: string | Partial<IPort>): IForwardRefNode {
    if (typeof port === 'string') {
      return { id: this.id, port };
    }
    return { id: this.id, ...port };
  }
}

/** @hidden */
export function isForwardRefNode(object: unknown): object is IForwardRefNode {
  return typeof object == 'object' && object !== null && typeof (object as IForwardRefNode).id === 'string';
}

/** @hidden */
export function isEdgeTarget(node: unknown): node is NodeRef {
  return node instanceof Node || isForwardRefNode(node);
}

/** @hidden */
export function isNodeRefLike(node: unknown): node is NodeRefLike {
  return typeof node === 'string' || isEdgeTarget(node);
}

/** @hidden */
export function isNodeRefGroupLike(target: NodeRefLike | NodeRefGroupLike): target is NodeRefGroupLike {
  return Array.isArray(target) && target.every(isNodeRefLike);
}
