import { AttributeKeyDict } from './key-dict.js';

export const attribute: AttributeKeyDict = new Proxy(Object.freeze({}) as AttributeKeyDict, {
  get: (_, key: string) => key,
});
