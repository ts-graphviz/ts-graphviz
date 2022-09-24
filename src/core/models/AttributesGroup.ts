import { AttributeKey, AttributesGroupModel } from '#lib/common';
import { AttributesBase } from './AttributesBase.js';

/**
 * A set of attribute values for any object.
 * @group Models
 */
export class AttributesGroup<T extends AttributeKey = AttributeKey>
  extends AttributesBase<T>
  implements AttributesGroupModel<T>
{
  public comment?: string;
}
