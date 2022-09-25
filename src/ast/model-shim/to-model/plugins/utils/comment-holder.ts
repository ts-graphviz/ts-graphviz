import { HasComment } from '#lib/common';
import { CommentASTNode, FileRange } from '../../../../types.js';

export class CommentHolder {
  public comment: CommentASTNode | null = null;

  public set(comment: CommentASTNode): void {
    this.comment = comment;
  }

  public reset(): void {
    this.comment = null;
  }

  public apply(model: HasComment, location?: FileRange): void {
    if (location && this.comment?.location) {
      if (this.comment?.kind === 'Block') {
        if (this.comment.location.end.line === location.start.line - 1) {
          model.comment = this.comment.value;
        }
      } else {
        if (this.comment.location.end.line === location.start.line) {
          model.comment = this.comment.value;
        }
      }
    } else {
      model.comment = this.comment?.value;
    }
    this.reset();
  }
}
