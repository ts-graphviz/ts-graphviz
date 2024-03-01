import { Attribute } from '@ts-graphviz/common';

/**
 * @group Attribute
 */
export const attribute: Attribute.keys = new Proxy(
  Object.freeze({}) as Attribute.keys,
  {
    get: (_, key: string) => key,
  },
);
