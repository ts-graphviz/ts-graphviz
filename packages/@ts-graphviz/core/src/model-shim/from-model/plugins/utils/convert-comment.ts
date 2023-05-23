import { CommentKind, CommentASTNode, createElement } from '@ts-graphviz/ast';

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
