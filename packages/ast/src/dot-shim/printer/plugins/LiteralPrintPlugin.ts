import type { LiteralASTNode } from '../../../types.js';
import type { PrintPlugin } from '../types.js';
import { escape } from './utils/escape.js';
import { isBalancedMarkup, isBareId } from './utils/literal.js';

export const LiteralPrintPlugin: PrintPlugin<LiteralASTNode> = {
  match(ast) {
    return ast.type === 'Literal';
  },
  *print(_context, ast) {
    const value = String(ast.value);
    // An AST may come from elsewhere than the parser (built by hand or read
    // from JSON): a value is written bare or as markup only when DOT reads it
    // back as the same single value, and as a quoted string otherwise.
    if (ast.quoted === 'html' && isBalancedMarkup(value)) {
      yield '<';
      yield value;
      yield '>';
    } else if (ast.quoted === false && isBareId(value)) {
      yield value;
    } else {
      yield '"';
      yield escape(value);
      yield '"';
    }
  },
};
