import type { ASTNode } from './types.js';
import type { PrintOptions } from './printer/types.js';
import { Printer } from './printer/index.js';

/**
 * Stringify Graphviz AST Node.
 *
 * @param ast Graphviz AST node.
 * @returns DOT language string.
 */
export function stringify(ast: ASTNode, options?: PrintOptions): string {
  const result = new Printer(options).print(ast);
  if (!result) {
    throw new Error();
  }
  return result;
}
