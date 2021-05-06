import { EdgeTargetLike, EdgeTarget, INode, IPort, IForwardRefNode, NodeAttributes, IAttributes } from '../types';
import { DotObject } from './abstract';
import { attribute } from '../attribute';
import { Attributes } from './attributes-base';
import { EdgeTargetsLike } from '../types';

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

export function isForwardRefNode(object: unknown): object is IForwardRefNode {
  return typeof object == 'object' && object !== null && typeof (object as IForwardRefNode).id === 'string';
}

/**
 * @hidden
 */
export function isEdgeTarget(node: unknown): node is EdgeTarget {
  return node instanceof Node || isForwardRefNode(node);
}

/**
 * @hidden
 */
export function isEdgeTargetLike(node: unknown): node is EdgeTargetLike {
  return typeof node === 'string' || isEdgeTarget(node);
}
/**
 * @hidden
 */
export function isEdgeTargetsLike(target: EdgeTargetLike | EdgeTargetsLike): target is EdgeTargetsLike {
  return Array.isArray(target) && target.every(isEdgeTargetLike);
}
