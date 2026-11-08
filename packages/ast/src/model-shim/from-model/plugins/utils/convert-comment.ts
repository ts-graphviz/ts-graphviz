import type { CommentModel, CommentPosition } from '@ts-graphviz/common';
import type { CreateElement } from '../../../../builder/types.js';
import { ownField } from '../../../../own-field.js';
import type {
  ASTNode,
  CommentASTNode,
  CommentKind,
} from '../../../../types.js';

function convertComment(
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

/**
 * The comments attached to a model. A model without `comments` has its
 * `comment` string as one leading comment.
 */
export function commentsOf(model: object): ReadonlyArray<CommentModel> {
  const comments = ownField(model as { comments?: unknown }, 'comments');
  if (Array.isArray(comments)) return comments as ReadonlyArray<CommentModel>;
  const comment = ownField(model as { comment?: unknown }, 'comment');
  return typeof comment === 'string'
    ? [
        {
          $$type: 'Comment',
          text: comment,
          kind: undefined,
          position: 'leading',
        },
      ]
    : [];
}

/**
 * The comment statements of a model's comments at `position`, in order; a
 * comment without a kind is written as `kind` (`commentKind`) says.
 */
export function* convertComments(
  createElement: CreateElement,
  model: object,
  position: CommentPosition,
  kind: CommentKind,
): Generator<CommentASTNode> {
  for (const comment of commentsOf(model)) {
    if (comment.position === position) {
      yield convertComment(createElement, comment.text, comment.kind ?? kind);
    }
  }
}

/**
 * `ast` with the model's trailing comments as its `trailingComments`, which
 * the printer writes after it on its line.
 */
export function withTrailingComments<T extends ASTNode>(
  createElement: CreateElement,
  ast: T,
  model: object,
  kind: CommentKind,
): T {
  const trailing = [...convertComments(createElement, model, 'trailing', kind)];
  if (trailing.length > 0) {
    (ast as { trailingComments?: CommentASTNode[] }).trailingComments = [
      ...(ownField(
        ast as { trailingComments?: CommentASTNode[] },
        'trailingComments',
      ) ?? []),
      ...trailing,
    ];
  }
  return ast;
}
