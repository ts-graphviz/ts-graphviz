import { createElement } from '../../../../builder/create-element.js';
import { CommentASTNode, CommentKind } from '../../../../types.js';

export function convertComment(value: string, kind: CommentKind): CommentASTNode {
  return createElement(
    'Comment',
    {
      kind: kind,
      value: value,
    },
    [],
  );
}
