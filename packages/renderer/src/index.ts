import type { ASTNode } from '@ts-graphviz/dot-ast';
import { Renderer } from './renderer';

export interface StringifyOption {
  directed?: boolean;
  indentSize?: number;
}

/**
 * Stringify Graphviz AST Node.
 *
 * @param ast Graphviz AST node.
 * @returns DOT language string.
 */
export function stringify(ast: ASTNode, options?: StringifyOption): string {
  return new Renderer(options).stringify(ast);
}
