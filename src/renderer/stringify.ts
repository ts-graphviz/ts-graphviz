import type { ASTNode } from '../ast/index.js';
import type { StringifyOption } from './types.js';
import { Renderer } from './renderer.js';

/**
 * Stringify Graphviz AST Node.
 *
 * @param ast Graphviz AST node.
 * @returns DOT language string.
 */
export function stringify(ast: ASTNode, options?: StringifyOption): string {
  return new Renderer(options).render(ast);
}
