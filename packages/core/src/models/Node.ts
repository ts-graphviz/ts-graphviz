import {
  ForwardRefNode,
  NodeAttributeKey,
  NodeAttributesObject,
  NodeModel,
  Port,
} from '@ts-graphviz/common';
import { AttributesGroup } from './AttributesGroup.js';
import { DotObject } from './DotObject.js';

/**
 * DOT object class representing a node.
 * @group Models
 */
export class Node extends DotObject implements NodeModel {
  public get $$type(): 'Node' {
    return 'Node';
  }
  public comment?: string;

  public readonly attributes: AttributesGroup<NodeAttributeKey>;

  constructor(
    public readonly id: string,
    attributes?: NodeAttributesObject,
  ) {
    super();
    this.attributes = new AttributesGroup(attributes);
  }

  public port(port: string | Partial<Port>): ForwardRefNode {
    if (typeof port === 'string') {
      return { id: this.id, port };
    }
    return { id: this.id, ...port };
  }
}
