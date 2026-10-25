import type { LiteralASTNode } from '../../../types.js';
import type { PrintPlugin } from '../types.js';

export const LiteralPrintPlugin: PrintPlugin<LiteralASTNode> = {
  match(ast) {
    return ast.type === 'Literal';
  },
  // A quoted Literal holds the raw source text (escapes intact), so it is
  // written back verbatim. Escaping happens when a model is converted to AST.
  *print(_context, ast) {
    switch (ast.kind) {
      // One token per literal: the printer indents after a token that is a
      // line break, and a raw newline inside a quoted or HTML string must
      // not be mistaken for one.
      case 'html':
        yield `<${ast.value}>`;
        return;
      case 'quoted':
        yield `"${ast.value}"`;
        return;
      case 'bare':
        yield ast.value;
        return;
    }
  },
};
