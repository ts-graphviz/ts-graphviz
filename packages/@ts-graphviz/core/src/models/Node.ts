import { NodeModel, NodeAttributeKey, NodeAttributesObject, Port, ForwardRefNode, define } from '@ts-graphviz/common';
import { DotObject } from './DotObject.js';
import { AttributesGroup } from './AttributesGroup.js';

/**
 * DOT object class representing a node.
 * @group Models
 */
@define({ type: 'Node' })
export class Node extends DotObject implements NodeModel {
  public comment?: string;

  public readonly attributes: AttributesGroup<NodeAttributeKey>;

  constructor(public readonly id: string, attributes?: NodeAttributesObject) {
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
