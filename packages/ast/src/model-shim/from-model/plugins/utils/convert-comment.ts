import type { CreateElement } from '../../../../builder/types.js';
import type { CommentASTNode, CommentKind } from '../../../../types.js';

export function convertComment(
  createElement: CreateElement,
  value: string,
  kind: CommentKind,
): CommentASTNode {
  return createElement(
    'Comment',
    {
      kind: kind,
      value: value,
    },
    [],
  );
}
