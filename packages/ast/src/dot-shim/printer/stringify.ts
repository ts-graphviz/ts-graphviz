import type { ASTNode } from '../../types.js';
import { Printer } from './printer.js';
import type { PrintOptions } from './types.js';

/**
 * stringify is a function that converts a Graphviz AST Node into a string in DOT language.
 *
 * @param ast - Graphviz AST node that is to be converted.
 * @param options - PrintOptions object containing formatting options.
 * @returns A string in DOT language.
 * @public
 */
export function stringify(ast: ASTNode, options?: PrintOptions): string {
  const result = new Printer(options).print(ast);
  if (!result) {
    throw new Error();
  }
  return result;
}
