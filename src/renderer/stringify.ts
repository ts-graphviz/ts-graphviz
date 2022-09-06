import type { ASTNode } from '../ast/index.js';
import type { StringifyOptions } from './types.js';
import { Printer } from './printer.js';

/**
 * Stringify Graphviz AST Node.
 *
 * @param ast Graphviz AST node.
 * @returns DOT language string.
 */
export function stringify(ast: ASTNode, options?: StringifyOptions): string {
  const result = new Printer(options).print(ast);
  if (!result) {
    throw new Error();
  }
  return result;
}
