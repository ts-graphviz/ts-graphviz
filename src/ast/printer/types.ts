import { ASTNode } from '../types.js';

export type IndentStyle = 'space' | 'tab';
export type EndOfLine = 'lf' | 'crlf';

export interface PrintOptions {
  indentStyle?: IndentStyle;
  indentSize?: number;
  endOfLine?: EndOfLine;
}

export interface PrintContext extends Required<PrintOptions> {
  directed: boolean;
  print(ast: ASTNode): string;
}

export interface PrintPlugin<T extends ASTNode = ASTNode> {
  match(ast: ASTNode): boolean;
  print(context: PrintContext, ast: T): string;
}
