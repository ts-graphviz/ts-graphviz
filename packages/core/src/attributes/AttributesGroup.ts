import type { AttributeKey, AttributesGroupModel } from '@ts-graphviz/common';
import { AttributesBase } from './AttributesBase.js';

/**
 * A set of attribute values held apart from an object.
 * @deprecated Nodes and edges hold their attributes themselves (they extend
 * {@link AttributesBase}); nothing in the library creates this class any
 * more. Removed in v5.
 * @group Models
 */
export class AttributesGroup<
    T extends AttributeKey = AttributeKey,
    E extends object = Record<never, never>,
  >
  extends AttributesBase<T, E>
  implements AttributesGroupModel<T, E> {}
