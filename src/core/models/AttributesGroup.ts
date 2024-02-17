import { AttributeKey, AttributesGroupModel } from '../../common.js';
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
