import type { ArgumentFits } from '@ts-graphviz/common';

// The places of the signatures, for readArguments of @ts-graphviz/common.

export const isString: ArgumentFits = (arg) => typeof arg === 'string';
export const isBoolean: ArgumentFits = (arg) => typeof arg === 'boolean';
/** An object of attributes or options: not an array or a function. */
export const isRecord: ArgumentFits = (arg) =>
  typeof arg === 'object' && arg !== null && !Array.isArray(arg);
