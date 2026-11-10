import {
  type CommentModel,
  type CommentPosition,
  withCode,
} from '@ts-graphviz/common';
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

/** The positions each model takes comments at, as the models' `addComment`. */
const POSITIONS: Readonly<Record<string, ReadonlyArray<CommentPosition>>> = {
  Node: ['leading', 'trailing'],
  Edge: ['leading', 'trailing'],
  AttributeList: ['leading', 'trailing'],
  Graph: ['leading', 'trailing', 'end'],
  Subgraph: ['leading', 'trailing', 'end'],
  Dot: ['leading', 'end'],
};

/**
 * Throws for a comment at a position the model does not take (an `'end'`
 * comment on a node made by hand), which would otherwise not be written.
 */
export function checkCommentPositions(model: { $$type: string }): void {
  const positions = Object.hasOwn(POSITIONS, model.$$type)
    ? POSITIONS[model.$$type]
    : undefined;
  if (positions === undefined) return;
  for (const comment of commentsOf(model)) {
    if (!positions.includes(comment.position)) {
      const position: unknown = comment.position;
      throw withCode(
        new TypeError(
          `A ${model.$$type} model takes no comment at ${typeof position === 'string' ? JSON.stringify(position.slice(0, 64)) : `a value of type ${typeof position}`}`,
        ),
        'TSG_ERR_INVALID_COMMENT',
      );
    }
  }
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
 * `ast` with the model's leading comments as its `leadingComments`, which
 * the printer writes on lines of their own before it.
 */
export function withLeadingComments<T extends ASTNode>(
  createElement: CreateElement,
  ast: T,
  model: object,
  kind: CommentKind,
): T {
  const leading = [...convertComments(createElement, model, 'leading', kind)];
  if (leading.length > 0) {
    (ast as { leadingComments?: CommentASTNode[] }).leadingComments = [
      ...leading,
      ...(ownField(
        ast as { leadingComments?: CommentASTNode[] },
        'leadingComments',
      ) ?? []),
    ];
  }
  return ast;
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
