import { escapeLiteral } from '../../../model-shim/literal.js';
import type { LiteralASTNode } from '../../../types.js';
import type { PrintPlugin } from '../types.js';
import { isBareId } from './utils/bare-id.js';

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
      // An AST built by hand can hold a bare value that is not one ID, such
      // as a keyword (`edge` would start a statement) or `1abc` (two tokens):
      // it is written quoted, which Graphviz reads as the same string.
      case 'bare':
        yield isBareId(ast.value) ? ast.value : `"${escapeLiteral(ast.value)}"`;
        return;
    }
  },
};
