import type { LiteralASTNode } from '../../../types.js';
import type { PrintPlugin } from '../types.js';

export const LiteralPrintPlugin: PrintPlugin<LiteralASTNode> = {
  match(ast) {
    return ast.type === 'Literal';
  },
  // A quoted Literal holds the raw source text (escapes intact), so it is
  // written back verbatim. Escaping happens when a model is converted to AST.
  *print(_context, ast) {
    switch (ast.quoted) {
      case 'html':
        yield '<';
        yield ast.value;
        yield '>';
        return;
      case true:
        yield '"';
        yield ast.value;
        yield '"';
        return;
      default: // case false:
        yield ast.value;
        return;
    }
  },
};
