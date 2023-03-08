import { CommentASTNode, CommentKind } from '../../../types.js';
import { EOL, PrintPlugin } from '../types.js';

const EOL_PTN = /\r?\n/;

const splitByLine = (value: string): string[] => value.split(EOL_PTN);

function getPadding(kind: CommentKind) {
  switch (kind) {
    case 'Block':
      return ' * ';
    case 'Macro':
      return '# ';
    case 'Slash':
      return '// ';
  }
}

export const CommentPrintPlugin: PrintPlugin<CommentASTNode> = {
  match(ast) {
    return ast.type === 'Comment';
  },
  *print(context, ast) {
    const linesIter = splitByLine(ast.value)[Symbol.iterator]();
    const padding = getPadding(ast.kind);
    if (ast.kind === 'Block') yield* ['/**', EOL];
    let next = linesIter.next();
    while (true) {
      yield padding;
      yield next.value;
      next = linesIter.next();
      if (!next.done) {
        yield EOL;
      } else {
        break;
      }
    }
    if (ast.kind === 'Block') yield* [EOL, ' */'];
  },
};
