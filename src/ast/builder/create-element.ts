import { CreateElement } from './types.js';
import { Builder } from './builder.js';
/**
 * Create an {@link ASTNode} of the specified type
 *
 * @param type - Type of the {@link ASTNode}
 * @param props - Properties of the {@link ASTNode}
 * @param children - Children of the {@link ASTNode}
 * @group Create AST
 * @returns An {@link ASTNode}
 */
export const createElement: CreateElement = Builder.prototype.createElement.bind(new Builder());
