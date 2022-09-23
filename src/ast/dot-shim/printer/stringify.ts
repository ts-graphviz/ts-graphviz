import type { ASTNode } from '../../types.js';
import type { PrintOptions } from './types.js';
import { Printer } from './printer.js';

/**
 * Stringify Graphviz AST Node.
 *
 * @param ast Graphviz AST node.
 * @returns DOT language string.
 * @group Convert AST to DOT
 */
export function stringify(ast: ASTNode, options?: PrintOptions): string {
  const result = new Printer(options).print(ast);
  if (!result) {
    throw new Error();
  }
  return result;
}
