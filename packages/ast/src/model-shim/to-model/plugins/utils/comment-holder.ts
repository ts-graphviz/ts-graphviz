import type { HasComment } from '@ts-graphviz/common';
import type { CommentASTNode, FileRange } from '../../../../types.js';

/**
 * Whether a comment should be attached to the statement at `location`.
 *
 * Without location information (e.g. a hand-built AST) the comment is always
 * attached. With it, a block comment must end on the line before the
 * statement and a line comment must end on the same line as the statement.
 */
export function isCommentAttachedTo(
  comment: CommentASTNode,
  location?: FileRange,
): boolean {
  if (!location || !comment.location) {
    return true;
  }
  return comment.kind === 'Block'
    ? comment.location.end.line === location.start.line - 1
    : comment.location.end.line === location.start.line;
}

export class CommentHolder {
  public comment: CommentASTNode | null = null;

  public set(comment: CommentASTNode): void {
    this.comment = comment;
  }

  public reset(): void {
    this.comment = null;
  }

  public apply(model: HasComment, location?: FileRange): void {
    if (this.comment && isCommentAttachedTo(this.comment, location)) {
      model.comment = this.comment.value;
    }
    this.reset();
  }
}
