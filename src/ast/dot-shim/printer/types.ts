import { ASTNode } from '../../types.js';

/**
 * @group Convert AST to DOT
 */
export type IndentStyle = 'space' | 'tab';

/**
 * @group Convert AST to DOT
 */
export type EndOfLine = 'lf' | 'crlf';

/**
 * @group Convert AST to DOT
 * @alpha
 */
export interface PrintOptions {
  indentStyle?: IndentStyle;
  indentSize?: number;
  endOfLine?: EndOfLine;
}

/**
 * @group Convert AST to DOT
 * @alpha
 */
export interface PrintContext extends Required<PrintOptions> {
  directed: boolean;
  print(ast: ASTNode): string;
}

/**
 * @group Convert AST to DOT
 * @alpha
 */
export interface PrintPlugin<T extends ASTNode = ASTNode> {
  match(ast: ASTNode): boolean;
  print(context: PrintContext, ast: T): string;
}
