import { pipe } from '@ts-graphviz/common';
import type { LiteralASTNode } from '../../../types.js';
import type { PrintPlugin } from '../types.js';
import { escape, wrapByPair, wrapWith } from './utils/index.js';

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
      default:
        return escape(ast.value);
    }
  },
};
