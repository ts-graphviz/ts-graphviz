import { CreateElement } from './types.js';
import { Builder } from './builder.js';

/**
 * @group Create AST
 */
export const createElement: CreateElement = Builder.prototype.createElement.bind(new Builder());
