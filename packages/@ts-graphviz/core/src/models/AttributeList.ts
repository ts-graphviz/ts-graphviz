import { AttributeKey, AttributeListKind, AttributeListModel, AttributesObject } from '@ts-graphviz/common';
import { AttributesBase } from './AttributesBase.js';

/**
 * A set of attribute values for any object.
 * @group Models
 */
export class AttributeList<K extends AttributeListKind, T extends AttributeKey = AttributeKey>
  extends AttributesBase<T>
  implements AttributeListModel<K, T>
{
  public get $$type(): 'AttributeList' {
    return 'AttributeList';
  }

  public comment?: string;

  constructor(public readonly $$kind: K, attributes?: AttributesObject<T>) {
    super(attributes);
  }
}
