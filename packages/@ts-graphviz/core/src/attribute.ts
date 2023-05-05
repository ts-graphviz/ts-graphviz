import { Attribute } from '@ts-graphviz/common';

/**
 * @group Attribute
 *
 * @deprecated Use {@link Attribute.keys} instead.
 */
export type AttributeKeyDict = Attribute.keys;

/**
 * @group Attribute
 */
export const attribute: Attribute.keys = new Proxy(Object.freeze({}) as Attribute.keys, {
  get: (_, key: string) => key,
});
