import {
  type AttributeAssignmentModel,
  type CommentModel,
  type CommentOptions,
  type DotValue,
  withCode,
} from '@ts-graphviz/common';
import { CommentList, STATEMENT_POSITIONS } from './comment-list.js';

/** `T`, not inferred from (TypeScript's `NoInfer`, which older versions lack). */
type Uninferred<T> = [T][T extends unknown ? 0 : never];

function invalid(message: string): TypeError {
  return withCode(
    new TypeError(message),
    'TSG_ERR_INVALID_ATTRIBUTE_ASSIGNMENT',
  );
}

function checkValue(value: unknown): void {
  if (value === null || value === undefined) {
    throw invalid(`An attribute assignment's value must be given: ${value}`);
  }
}

/**
 * A graph attribute assignment (`color=blue;` in a graph's body), where it
 * is written: see {@link AttributeAssignmentModel}.
 * @group Models
 */
export class AttributeAssignment<
  K extends string = string,
  V extends DotValue = DotValue,
> implements AttributeAssignmentModel<K, V>
{
  public get $$type(): 'AttributeAssignment' {
    return 'AttributeAssignment';
  }

  readonly #comments: CommentList = new CommentList(STATEMENT_POSITIONS);
  #value: V;

  /** The comments attached to the assignment, in the order they were added. */
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

  /** Remove a comment that was attached to the assignment. */
  public removeComment(comment: CommentModel): void {
    this.#comments.remove(comment);
  }

  public get value(): V {
    return this.#value;
  }

  public set value(value: V) {
    checkValue(value);
    this.#value = value;
  }

  /**
   * @param key - The attribute's name.
   * @param value - The attribute's value.
   * @throws A `TypeError` with code `TSG_ERR_INVALID_ATTRIBUTE_ASSIGNMENT`
   * for a key that is not a string, or a `null` or `undefined` value.
   */
  constructor(
    public readonly key: K,
    // Not inferred: the value's type is the default, any value, unless one
    // is given.
    value: Uninferred<V>,
  ) {
    if (typeof key !== 'string') {
      throw invalid(
        `An attribute assignment's key must be a string: a value of type ${typeof key}`,
      );
    }
    checkValue(value);
    this.#value = value as V;
  }
}
