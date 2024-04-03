import type { Attribute } from '@ts-graphviz/common';

/**
 * Attribute constant.
 * @public
 */
export const attribute: Attribute.keys = new Proxy(
  Object.freeze({}) as Attribute.keys,
  {
    get: (_, key: string) => key,
  },
);
