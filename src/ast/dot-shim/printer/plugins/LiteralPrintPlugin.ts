import { LiteralASTNode } from '../../../types.js';
import { PrintPlugin } from '../types.js';

export const escape = (value: string): string => value.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/"/g, '\\"');

export const LiteralPrintPlugin: PrintPlugin<LiteralASTNode> = {
  match(ast) {
    return ast.type === 'Literal';
  },
  *print(context, ast) {
    switch (ast.quoted) {
      case 'html':
        yield '<';
        yield escape(ast.value);
        yield '>';
        return;
      case true:
        yield '"';
        yield escape(ast.value);
        yield '"';
        return;
      case false:
      default:
        yield escape(ast.value);
        return;
    }
  },
};
