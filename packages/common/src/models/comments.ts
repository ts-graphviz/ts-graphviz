/**
 * The kind of a DOT comment: `Block` (`/* … *\/`), `Slash` (`// …`) or
 * `Macro` (`# …`, a line Graphviz reads as a preprocessor line).
 * @group Models
 */
export type CommentKind = 'Block' | 'Slash' | 'Macro';

/**
 * Where a comment is written, relative to the object it is attached to:
 *
 * - `'leading'`: on lines of its own before the object;
 * - `'trailing'`: after the object, on the line it ends;
 * - `'end'`: at the end of the body of a graph, a subgraph or a DOT source,
 *   attached to none of its statements.
 * @group Models
 */
export type CommentPosition = 'leading' | 'trailing' | 'end';

/**
 * A comment attached to an object of the DOT Object Model.
 *
 * Comments are values: to change one, remove it and add another.
 * @group Models
 */
export interface CommentModel {
  readonly $$type: 'Comment';
  /** The text, without the comment markers. */
  readonly text: string;
  /**
   * The kind of comment; `undefined` writes it as `fromModel`'s
   * `commentKind` option says (`Slash` by default).
   */
  readonly kind: CommentKind | undefined;
  readonly position: CommentPosition;
}

/**
 * The options of `addComment`.
 * @typeParam P - The positions the object takes.
 * @group Models
 */
export interface CommentOptions<
  P extends CommentPosition = 'leading' | 'trailing',
> {
  /** Where the comment is written; `'leading'` by default. */
  position?: P;
  /** The kind of comment; by default as `fromModel`'s `commentKind` says. */
  kind?: CommentKind;
}

/**
 * An object that comments can be attached to.
 * @typeParam P - The positions the object takes: a statement takes
 * `'leading'` and `'trailing'`, a graph or subgraph `'end'` too, a DOT
 * source `'leading'` and `'end'`.
 * @group Models
 */
export interface HasComments<
  P extends CommentPosition = 'leading' | 'trailing',
> {
  /** The comments attached to the object, in the order they were added. */
  readonly comments: ReadonlyArray<CommentModel>;
  /**
   * Attach a comment.
   * @returns The comment, to remove it later.
   * @throws TypeError with code `TSG_ERR_INVALID_COMMENT` for a text that is
   * not a string, or a position or kind the object does not take.
   */
  addComment(text: string, options?: CommentOptions<P>): CommentModel;
  /** Remove a comment that was attached to the object (by identity). */
  removeComment(comment: CommentModel): void;
}

/**
 * An object whose attached comments can be read.
 * @group Models
 */
export interface ReadonlyHasComments {
  /** The comments attached to the object, in the order they were added. */
  readonly comments?: ReadonlyArray<CommentModel>;
}

const KINDS: ReadonlySet<unknown> = new Set(['Block', 'Slash', 'Macro']);
const POSITIONS: ReadonlySet<unknown> = new Set(['leading', 'trailing', 'end']);

/**
 * Type guard to check if a value is a {@link CommentModel}.
 * @group Models
 */
export function isCommentModel(value: unknown): value is CommentModel {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    Object.hasOwn(record, '$$type') &&
    record.$$type === 'Comment' &&
    typeof record.text === 'string' &&
    POSITIONS.has(record.position) &&
    (record.kind === undefined || KINDS.has(record.kind))
  );
}
