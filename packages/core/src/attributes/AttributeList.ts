import type {
  AttributeKey,
  AttributeListKind,
  AttributeListModel,
  AttributesObject,
} from '@ts-graphviz/common';
import { AttributesBase } from './AttributesBase.js';

/**
 * A set of attribute values for any object.
 * @group Models
 */
export class AttributeList<
    K extends AttributeListKind,
    T extends AttributeKey = AttributeKey,
    E extends object = Record<never, never>,
  >
  extends AttributesBase<T, E>
  implements AttributeListModel<K, T, E>
{
  public get $$type(): 'AttributeList' {
    return 'AttributeList';
  }

  public comment?: string;

  constructor(
    public readonly $$kind: K,
    attributes?: AttributesObject<T, E>,
  ) {
    super(attributes);
  }
}
