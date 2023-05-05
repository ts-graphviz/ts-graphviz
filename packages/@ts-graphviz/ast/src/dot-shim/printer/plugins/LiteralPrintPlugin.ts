import { pipe } from '../../utils/functional.js';
import { LiteralASTNode } from '../../../types.js';
import { PrintPlugin } from '../types.js';
import { escape, wrapWith, wrapByPair } from './utils/index.js';

const quoteLiteralValue = pipe(escape, wrapWith('"'));

const quoteHTMLLikeLiteralValue = wrapByPair('<', '>');

export const LiteralPrintPlugin: PrintPlugin<LiteralASTNode> = {
  match(ast) {
    return ast.type === 'Literal';
  },
  print(context, ast): string {
    switch (ast.quoted) {
      case 'html':
        return quoteHTMLLikeLiteralValue(ast.value);
      case true:
        return quoteLiteralValue(ast.value);
      case false:
      default:
        return escape(ast.value);
    }
  },
};
