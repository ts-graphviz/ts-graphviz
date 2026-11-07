import type {
  EmptySchema,
  ForwardRefNode,
  NodeAttributeKey,
  NodeAttributesObject,
  NodeModel,
  Port,
  Schema,
  SchemaAttributeTypes,
} from '@ts-graphviz/common';
import { AttributesGroup } from '../attributes/AttributesGroup.js';
import { DotObject } from './DotObject.js';

/**
 * DOT object class representing a node.
 *
 * @typeParam S - The schema of the models, which types the attributes;
 * none by default.
 * @group Models
 */
export class Node<S extends Schema = EmptySchema>
  extends DotObject
  implements NodeModel<S>
{
  public get $$type(): 'Node' {
    return 'Node';
  }
  public comment?: string;

  public readonly attributes: AttributesGroup<
    NodeAttributeKey,
    SchemaAttributeTypes<S, 'node'>
  >;

  constructor(
    public readonly id: string,
    attributes?: NodeAttributesObject<S>,
  ) {
    super();
    this.attributes = new AttributesGroup<
      NodeAttributeKey,
      SchemaAttributeTypes<S, 'node'>
    >(attributes);
  }

  public port(port: string | Partial<Port>): ForwardRefNode {
    if (typeof port === 'string') {
      return { id: this.id, port };
    }
    return { id: this.id, ...port };
  }
}
