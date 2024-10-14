import type { CommentASTNode, CommentKind } from '../../../types.js';
import type { PrintPlugin } from '../types.js';

const EOL_PATTERN = /\r?\n/;

const paddingMap: Record<CommentKind, string> = {
  Block: ' * ',
  Macro: '# ',
  Slash: '// ',
};

export const CommentPrintPlugin: PrintPlugin<CommentASTNode> = {
  match(ast) {
    return ast.type === 'Comment';
  },
  *print(context, ast) {
    const padding = paddingMap[ast.kind];
    if (ast.kind === 'Block') {
      yield* ['/**', context.EOL];
    }
    const lines = ast.value.split(EOL_PATTERN);
    const lineLength = lines.length;
    for (let i = 0; i < lineLength; i++) {
      yield padding;
      yield lines[i];
      if (i < lineLength - 1) {
        yield context.EOL;
      }
    }
    if (ast.kind === 'Block') {
      yield* [context.EOL, ' */'];
    }
  },
};
