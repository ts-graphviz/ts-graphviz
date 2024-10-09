import type { LiteralASTNode } from '../../../types.js';
import type { PrintPlugin } from '../types.js';
import { escape } from './utils/escape.js';

export const LiteralPrintPlugin: PrintPlugin<LiteralASTNode> = {
  match(ast) {
    return ast.type === 'Literal';
  },
  *print(context, ast) {
    switch (ast.quoted) {
      case 'html':
        yield '<';
        yield ast.value;
        yield '>';
        return;
      case true:
        yield '"';
        yield escape(ast.value);
        yield '"';
        return;
      default: // case false:
        yield ast.value;
        return;
    }
  },
};
