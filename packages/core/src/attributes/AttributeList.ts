import type {
  AttributeKey,
  AttributeListKind,
  AttributeListModel,
  AttributesObject,
  CommentModel,
  CommentOptions,
} from '@ts-graphviz/common';
import { CommentList, STATEMENT_POSITIONS } from '../models/comment-list.js';
import { AttributesBase } from './AttributesBase.js';

/**
 * A set of attribute values for any object.
 * @group Models
 */
export class AttributeList<
    K extends AttributeListKind,
    T extends AttributeKey = AttributeKey,
    E extends object = Record<never, never>,
  >
  extends AttributesBase<T, E>
  implements AttributeListModel<K, T, E>
{
  public get $$type(): 'AttributeList' {
    return 'AttributeList';
  }

  readonly #comments: CommentList = new CommentList(STATEMENT_POSITIONS);

  /** The comments attached to the attribute list, in the order they were added. */
  public get comments(): ReadonlyArray<CommentModel> {
    return this.#comments.items;
  }

  /**
   * Attach a comment (`leading` | `trailing`).
   * @returns The comment, to remove it later.
   */
  public addComment(
    text: string,
    options?: CommentOptions<'leading' | 'trailing'>,
  ): CommentModel {
    return this.#comments.add(text, options);
  }

  /** Remove a comment that was attached to the attribute list. */
  public removeComment(comment: CommentModel): void {
    this.#comments.remove(comment);
  }

  /**
   * The text of the first leading comment: setting replaces it (keeping its
   * kind) or adds one, and `undefined` removes it.
   * @deprecated Use `comments`, `addComment` and `removeComment`. Removed in
   * v5.
   */
  public get comment(): string | undefined {
    return this.#comments.firstLeading;
  }

  public set comment(text: string | undefined) {
    this.#comments.setFirstLeading(text);
  }

  constructor(
    public readonly $$kind: K,
    attributes?: AttributesObject<T, E>,
  ) {
    super();
    // Once `$$kind` is set, for an overridden `setAttribute`.
    if (attributes !== undefined) this.setAttributes(attributes);
  }
}
