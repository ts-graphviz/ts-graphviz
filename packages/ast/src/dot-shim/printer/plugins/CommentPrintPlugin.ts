import { map, pipe } from '@ts-graphviz/common';
import type { CommentASTNode } from '../../../types.js';
import type { PrintPlugin } from '../types.js';
import {
  endOfLine,
  joinBy,
  leftPadWith,
  splitByLine,
  wrapByPair,
} from './utils/index.js';

export const CommentPrintPlugin: PrintPlugin<CommentASTNode> = {
  match(ast) {
    return ast.type === 'Comment';
  },
  print(context, ast): string {
    const eol = endOfLine(context.endOfLine);
    switch (ast.kind) {
      case 'Block':
        return pipe(
          splitByLine,
          map(leftPadWith(' * ')),
          joinBy(eol),
          wrapByPair(`/**${eol}`, `${eol} */`),
        )(ast.value);
      case 'Macro':
        return pipe(
          splitByLine,
          map(leftPadWith('# ')),
          joinBy(eol),
        )(ast.value);
      default:
        return pipe(
          splitByLine,
          map(leftPadWith('// ')),
          joinBy(eol),
        )(ast.value);
    }
  },
};
