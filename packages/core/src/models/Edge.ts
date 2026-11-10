import {
  type AttributesGroupModel,
  type CommentModel,
  type CommentOptions,
  type EdgeAttributeKey,
  type EdgeAttributesObject,
  type EdgeModel,
  type EdgeTargetTuple,
  type EmptySchema,
  isNodeRefLike,
  modelOf,
  type ReadonlyEdgeTargetTuple,
  type Schema,
  type SchemaAttributeTypes,
  withCode,
} from '@ts-graphviz/common';
import { AttributesBase } from '../attributes/AttributesBase.js';
import { AttributesView } from '../attributes/AttributesView.js';
import { CommentList, STATEMENT_POSITIONS } from './comment-list.js';

/**
 * DOT object class representing a edge.
 *
 * @typeParam S - The schema of the models, which types the attributes;
 * none by default.
 * @group Models
 */
export class Edge<S extends Schema = EmptySchema>
  extends AttributesBase<EdgeAttributeKey, SchemaAttributeTypes<S, 'edge'>>
  implements EdgeModel<S>
{
  public get $$type(): 'Edge' {
    return 'Edge';
  }

  readonly #comments: CommentList = new CommentList(STATEMENT_POSITIONS);

  /** The comments attached to the edge, in the order they were added. */
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

  /** Remove a comment that was attached to the edge. */
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

  #attributes?: AttributesView<
    EdgeAttributeKey,
    SchemaAttributeTypes<S, 'edge'>
  >;

  /**
   * A view of the edge's attributes: every method goes to the edge itself, so
   * `edge.attributes.set(...)` and `edge.setAttribute(...)` change the same
   * attributes.
   * @deprecated Call `getAttribute`, `setAttribute` and the others on the
   * edge. Removed in v5.
   */
  public get attributes(): AttributesGroupModel<
    EdgeAttributeKey,
    SchemaAttributeTypes<S, 'edge'>
  > {
    this.#attributes ??= new AttributesView(this);
    return this.#attributes;
  }

  public readonly targets: EdgeTargetTuple;

  constructor(
    targets: ReadonlyEdgeTargetTuple,
    attributes?: EdgeAttributesObject<S>,
  ) {
    super();
    // A copy, so the edge does not change with the caller's arrays; and the
    // nodes themselves, never objects standing for them (a DSL).
    const ts = targets.map((target) =>
      Array.isArray(target) ? target.map(modelOf) : modelOf(target),
    ) as EdgeTargetTuple;
    if (
      ts.length < 2 &&
      (isNodeRefLike(ts[0]) && isNodeRefLike(ts[1])) === false
    ) {
      throw withCode(
        new TypeError(
          'The element of Edge target is missing or not satisfied as Edge target.',
        ),
        'TSG_ERR_INVALID_EDGE_TARGETS',
      );
    }
    this.targets = ts;
    // Once the targets are checked and set, for an overridden `setAttribute`.
    if (attributes !== undefined) this.setAttributes(attributes);
  }
}
