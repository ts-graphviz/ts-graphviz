import { CommentASTNode } from '../../types.js';
import { PrintPlugin } from '../types.js';
import { map, leftPadWith, pipe, splitByLine, joinBy, wrapByPair, endOfLine } from './utils/index.js';

export const CommentPrintPlugin: PrintPlugin<CommentASTNode> = {
  match(ast) {
    return ast.type === 'Comment';
  },
  print(context, ast): string {
    const eol = endOfLine(context.endOfLine);
    switch (ast.kind) {
      case 'Block':
        return pipe(splitByLine, map(leftPadWith(' * ')), joinBy(eol), wrapByPair(`/**${eol}`, `${eol} */`))(ast.value);
      case 'Macro':
        return pipe(splitByLine, map(leftPadWith('# ')), joinBy(eol))(ast.value);
      case 'Slash':
      default:
        return pipe(splitByLine, map(leftPadWith('// ')), joinBy(eol))(ast.value);
    }
  },
};
