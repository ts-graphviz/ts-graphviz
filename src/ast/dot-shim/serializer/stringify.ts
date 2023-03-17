import type { ASTNode } from '../../types.js';
import type { SerializeOptions } from './types.js';
import { Serializer } from './serializer.js';

/**
 * stringify is a function that converts a Graphviz AST Node into a string in DOT language.
 *
 * @param ast Graphviz AST node that is to be converted.
 * @param options {@link SerializeOptions} object containing formatting options.
 * @returns A string in DOT language.
 * @group Convert AST to DOT
 */
export function stringify(ast: ASTNode, options?: SerializeOptions): string {
  let dot = '';
  for (const parts of new Serializer(options).serialize(ast)) dot += parts;
  if (!dot) throw new Error();
  return dot;
}
