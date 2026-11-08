import type {
  AttributesGroupModel,
  CommentModel,
  CommentOptions,
  EmptySchema,
  ForwardRefNode,
  NodeAttributeKey,
  NodeAttributesObject,
  NodeModel,
  Port,
  Schema,
  SchemaAttributeTypes,
} from '@ts-graphviz/common';
import { AttributesBase } from '../attributes/AttributesBase.js';
import { AttributesView } from '../attributes/AttributesView.js';
import { CommentList, STATEMENT_POSITIONS } from './comment-list.js';

/**
 * DOT object class representing a node.
 *
 * @typeParam S - The schema of the models, which types the attributes;
 * none by default.
 * @group Models
 */
export class Node<S extends Schema = EmptySchema>
  extends AttributesBase<NodeAttributeKey, SchemaAttributeTypes<S, 'node'>>
  implements NodeModel<S>
{
  public get $$type(): 'Node' {
    return 'Node';
  }
  readonly #comments: CommentList = new CommentList(STATEMENT_POSITIONS);

  /** The comments attached to the node, in the order they were added. */
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

  /** Remove a comment that was attached to the node. */
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
    NodeAttributeKey,
    SchemaAttributeTypes<S, 'node'>
  >;

  /**
   * The attributes of the node, as 3.x held them apart: every method goes
   * to the node itself, so `node.attributes.set(...)` and
   * `node.setAttribute(...)` change the same attributes.
   * @deprecated Call `getAttribute`, `setAttribute` and the others on the
   * node. Removed in v5.
   */
  public get attributes(): AttributesGroupModel<
    NodeAttributeKey,
    SchemaAttributeTypes<S, 'node'>
  > {
    this.#attributes ??= new AttributesView(this);
    return this.#attributes;
  }

  /** The node's name: its ID in DOT (`a` in `a -> b`). */
  public get nodeId(): string {
    return this.id;
  }

  constructor(
    /**
     * The node's name.
     * @deprecated Read `nodeId` (in the DOT DSL, `id` is Graphviz's `id`
     * attribute). Removed in v5.
     */
    public readonly id: string,
    attributes?: NodeAttributesObject<S>,
  ) {
    super();
    // Once `id` is set, for an overridden `setAttribute`.
    if (attributes !== undefined) this.setAttributes(attributes);
  }

  public port(port: string | Partial<Port>): ForwardRefNode {
    if (typeof port === 'string') {
      return { id: this.id, port };
    }
    return { id: this.id, ...port };
  }
}
