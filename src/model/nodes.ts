import { INode, IPort, IForwardRefNode, NodeAttributes, IAttributes } from '../types';
import { DotObject } from './abstract';
import { attribute } from '../attribute';
import { Attributes } from './attributes-base';

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
