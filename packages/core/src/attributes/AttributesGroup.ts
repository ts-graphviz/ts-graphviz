import type { AttributeKey, AttributesGroupModel } from '@ts-graphviz/common';
import { AttributesBase } from './AttributesBase.js';

/**
 * A set of attribute values for any object.
 * @group Models
 */
export class AttributesGroup<
    T extends AttributeKey = AttributeKey,
    E extends object = Record<never, never>,
  >
  extends AttributesBase<T, E>
  implements AttributesGroupModel<T, E> {}
