import type { CommentPosition, HasComments } from '@ts-graphviz/common';
import { ownField } from '../../../../own-field.js';
import type { ASTNode, CommentASTNode } from '../../../../types.js';

/** What a comment is attached to: a model that takes comments. */
type Holder = Pick<HasComments, 'addComment'>;

/** A container, which also takes comments at the end of its body. */
type Container = {
  addComment(
    text: string,
    options?: { position?: CommentPosition; kind?: CommentASTNode['kind'] },
  ): unknown;
};

/**
 * Attaches the comments of one body (a graph's, a subgraph's or a DOT
 * source's) to the models of its statements, by where they are:
 *
 * - a comment that starts on the line where the previous statement ends
 *   trails it (`'trailing'`);
 * - any other comment leads the next statement that is a model
 *   (`'leading'`), so the comments keep their order;
 * - comments after the last such statement are the body's (`'end'`).
 *
 * Without locations (an AST built in code) no comment trails. A statement
 * that is not a model, a graph attribute assignment (`color=blue`), takes
 * none: the comments before it lead the next model.
 */
export class BodyComments {
  #pending: CommentASTNode[] = [];
  #previous: { model: Holder; line: number } | undefined;

  /** A comment statement of the body. */
  comment(comment: CommentASTNode): void {
    const previous = this.#previous;
    const line = comment.location?.start.line;
    if (
      previous !== undefined &&
      this.#pending.length === 0 &&
      line !== undefined &&
      line === previous.line
    ) {
      previous.model.addComment(comment.value, {
        position: 'trailing',
        kind: comment.kind,
      });
      return;
    }
    this.#pending.push(comment);
  }

  /**
   * A statement of the body, converted to `model`; `undefined` for one that
   * is not a model. The comments the parser attached to the statement node
   * itself (`leadingComments`, `trailingComments`) go with it.
   */
  statement(model: Holder | undefined, ast: ASTNode): void {
    if (model === undefined) {
      this.#previous = undefined;
      return;
    }
    for (const comment of this.#pending) {
      model.addComment(comment.value, {
        position: 'leading',
        kind: comment.kind,
      });
    }
    this.#pending = [];
    for (const comment of ownField(ast, 'leadingComments') ?? []) {
      model.addComment(comment.value, {
        position: 'leading',
        kind: comment.kind,
      });
    }
    for (const comment of ownField(ast, 'trailingComments') ?? []) {
      model.addComment(comment.value, {
        position: 'trailing',
        kind: comment.kind,
      });
    }
    const line = ownField(ast, 'location')?.end.line;
    this.#previous = line === undefined ? undefined : { model, line };
  }

  /** The end of the body: the comments left are the container's. */
  end(container: Container): void {
    for (const comment of this.#pending) {
      container.addComment(comment.value, {
        position: 'end',
        kind: comment.kind,
      });
    }
    this.#pending = [];
  }
}
