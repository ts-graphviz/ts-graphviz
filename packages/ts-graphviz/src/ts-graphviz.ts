/**
 * @module ts-graphviz
 */
import { registerDefault } from '@ts-graphviz/core';
registerDefault();

export * from '@ts-graphviz/common';
export * from '@ts-graphviz/core';
export * from './lib/attribute.js';
export * from './lib/from-dot.js';
export * from './lib/model-factory.js';
export * from './lib/to-dot.js';
export * from './lib/types.js';
