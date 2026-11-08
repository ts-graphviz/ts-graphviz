import {
  type CommentKind,
  type CommentModel,
  type CommentOptions,
  type CommentPosition,
  ownOptions,
  withCode,
} from '@ts-graphviz/common';

const KINDS: ReadonlySet<unknown> = new Set(['Block', 'Slash', 'Macro']);

/** The positions a statement takes. */
export const STATEMENT_POSITIONS: ReadonlySet<CommentPosition> = new Set([
  'leading',
  'trailing',
]);
/** The positions a graph or subgraph takes. */
export const GRAPH_POSITIONS: ReadonlySet<CommentPosition> = new Set([
  'leading',
  'trailing',
  'end',
]);
/** The positions a DOT source takes. */
export const DOT_POSITIONS: ReadonlySet<CommentPosition> = new Set([
  'leading',
  'end',
]);

function invalid(message: string): TypeError {
  return withCode(new TypeError(message), 'TSG_ERR_INVALID_COMMENT');
}

function describe(value: unknown): string {
  return typeof value === 'string'
    ? JSON.stringify(value.slice(0, 64))
    : `a value of type ${typeof value}`;
}

/**
 * The comments attached to one object of the DOT Object Model. Internal: the
 * models expose `comments`, `addComment` and `removeComment`.
 */
export class CommentList {
  readonly #positions: ReadonlySet<CommentPosition>;
  #items: CommentModel[] = [];

  constructor(positions: ReadonlySet<CommentPosition>) {
    this.#positions = positions;
  }

  get items(): ReadonlyArray<CommentModel> {
    return Object.freeze([...this.#items]);
  }

  add(text: unknown, options?: CommentOptions<CommentPosition>): CommentModel {
    // Own properties only: an inherited one is never an option (#1757).
    const { position = 'leading', kind } = ownOptions(options);
    if (typeof text !== 'string') {
      throw invalid(`A comment's text must be a string: ${describe(text)}`);
    }
    if (!this.#positions.has(position)) {
      throw invalid(
        `This object takes comments at ${[...this.#positions].join(', ')}, not at ${describe(position)}`,
      );
    }
    if (kind !== undefined && !KINDS.has(kind)) {
      throw invalid(
        `A comment's kind must be Block, Slash or Macro: ${describe(kind)}`,
      );
    }
    const comment: CommentModel = Object.freeze({
      $$type: 'Comment',
      text,
      kind: kind as CommentKind | undefined,
      position,
    });
    this.#items.push(comment);
    return comment;
  }

  remove(comment: CommentModel): void {
    const index = this.#items.indexOf(comment);
    if (index !== -1) this.#items.splice(index, 1);
  }

  /** The text of the first leading comment (the deprecated `comment`). */
  get firstLeading(): string | undefined {
    return this.#items.find((c) => c.position === 'leading')?.text;
  }

  /**
   * Replace the text of the first leading comment, keeping its kind and its
   * place among the comments; add a leading comment before the others when
   * there is none; remove it for `undefined` (the deprecated `comment`).
   */
  setFirstLeading(text: string | undefined): void {
    const index = this.#items.findIndex((c) => c.position === 'leading');
    if (text === undefined) {
      if (index !== -1) this.#items.splice(index, 1);
      return;
    }
    if (index === -1) {
      this.add(text);
      // Before the other comments: it is the first leading one.
      this.#items.unshift(this.#items.pop() as CommentModel);
      return;
    }
    const kind = this.#items[index].kind;
    const replacement = this.add(text, { kind });
    this.#items.pop();
    this.#items[index] = replacement;
  }

  /** All the texts joined by line breaks (a DOT source's deprecated `comment`). */
  get joined(): string | undefined {
    return this.#items.length === 0
      ? undefined
      : this.#items.map((c) => c.text).join('\n');
  }

  /** Replace every comment by one leading comment, or none for `undefined`. */
  setOnly(text: string | undefined): void {
    this.#items = [];
    if (text !== undefined) this.add(text);
  }
}
