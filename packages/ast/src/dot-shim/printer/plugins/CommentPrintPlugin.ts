import type { CommentASTNode, CommentKind } from '../../../types.js';
import type { PrintPlugin } from '../types.js';
import { escapeComment } from './utils/escape-comment.js';

const EOL_PATTERN = /\r\n|\r|\n/;

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
    if (!Object.hasOwn(paddingMap, ast.kind)) {
      throw new TypeError(
        `A comment's kind must be 'Block', 'Macro' or 'Slash', not ${JSON.stringify(String(ast.kind))}.`,
      );
    }
    const padding = paddingMap[ast.kind];
    if (ast.kind === 'Block') {
      yield* ['/**', context.EOL];
    }
    const escapedValue = escapeComment(ast.value, ast.kind);
    const lines = escapedValue.split(EOL_PATTERN);
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
