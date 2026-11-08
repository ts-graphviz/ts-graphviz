import type {
  AttributesGroupModel,
  EmptySchema,
  ForwardRefNode,
  NodeAttributeKey,
  NodeAttributesObject,
  NodeModel,
  Port,
  Schema,
  SchemaAttributeTypes,
} from '@ts-graphviz/common';
import { AttributesBase } from '../attributes/AttributesBase.js';
import { AttributesView } from '../attributes/AttributesView.js';

/**
 * DOT object class representing a node.
 *
 * @typeParam S - The schema of the models, which types the attributes;
 * none by default.
 * @group Models
 */
export class Node<S extends Schema = EmptySchema>
  extends AttributesBase<NodeAttributeKey, SchemaAttributeTypes<S, 'node'>>
  implements NodeModel<S>
{
  public get $$type(): 'Node' {
    return 'Node';
  }
  public comment?: string;

  #attributes?: AttributesView<
    NodeAttributeKey,
    SchemaAttributeTypes<S, 'node'>
  >;

  /**
   * The attributes of the node, as 3.x held them apart: every method goes
   * to the node itself, so `node.attributes.set(...)` and
   * `node.setAttribute(...)` change the same attributes.
   * @deprecated Call `getAttribute`, `setAttribute` and the others on the
   * node. Removed in v5.
   */
  public get attributes(): AttributesGroupModel<
    NodeAttributeKey,
    SchemaAttributeTypes<S, 'node'>
  > {
    this.#attributes ??= new AttributesView(this);
    return this.#attributes;
  }

  constructor(
    public readonly id: string,
    attributes?: NodeAttributesObject<S>,
  ) {
    super();
    // Once `id` is set, for an overridden `setAttribute`.
    if (attributes !== undefined) this.setAttributes(attributes);
  }

  public port(port: string | Partial<Port>): ForwardRefNode {
    if (typeof port === 'string') {
      return { id: this.id, port };
    }
    return { id: this.id, ...port };
  }
}
