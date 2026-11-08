import {
  type CommentModel,
  type CommentOptions,
  type DotModel,
  type EmptySchema,
  type ModelTypes,
  modelOf,
  type RootGraphModel,
  type Schema,
} from '@ts-graphviz/common';
import { CommentList, DOT_POSITIONS } from './comment-list.js';

/**
 * Model of a whole DOT source: the root graphs it contains and the comments
 * that are not attached to a graph.
 *
 * It is the model counterpart of the `Dot` AST node.
 *
 * @typeParam S - The schema of its root graphs; none by default.
 * @group Models
 */
export class Dot<S extends Schema = EmptySchema> implements DotModel<S> {
  public get $$type(): 'Dot' {
    return 'Dot';
  }

  readonly #comments: CommentList = new CommentList(DOT_POSITIONS);

  /** The comments of the DOT source that belong to no graph. */
  public get comments(): ReadonlyArray<CommentModel> {
    return this.#comments.items;
  }

  /**
   * Attach a comment, `'leading'` (default: before the graphs) or `'end'`
   * (after them).
   * @returns The comment, to remove it later.
   */
  public addComment(
    text: string,
    options?: CommentOptions<'leading' | 'end'>,
  ): CommentModel {
    return this.#comments.add(text, options);
  }

  /** Remove a comment that was attached to the DOT source. */
  public removeComment(comment: CommentModel): void {
    this.#comments.remove(comment);
  }

  /**
   * All the texts of the source's own comments, joined by line breaks;
   * setting replaces them all by one leading comment, and `undefined`
   * removes them.
   * @deprecated Use `comments`, `addComment` and `removeComment`. Removed in
   * v5.
   */
  public get comment(): string | undefined {
    return this.#comments.joined;
  }

  public set comment(text: string | undefined) {
    this.#comments.setOnly(text);
  }

  readonly #graphs: RootGraphModel<ModelTypes<S>>[];

  constructor(graphs: RootGraphModel<ModelTypes<S>>[] = [], comment?: string) {
    // The models themselves, never objects standing for them (a DSL).
    this.#graphs = graphs.map(modelOf);
    this.#comments.setOnly(comment);
  }

  get graphs(): ReadonlyArray<RootGraphModel<ModelTypes<S>>> {
    return this.#graphs;
  }

  public addGraph(graph: RootGraphModel<ModelTypes<S>>): void {
    if (!this.existGraph(graph)) {
      this.#graphs.push(modelOf(graph));
    }
  }

  public existGraph(graph: RootGraphModel<ModelTypes<S>>): boolean {
    return this.#graphs.includes(modelOf(graph));
  }

  public removeGraph(graph: RootGraphModel<ModelTypes<S>>): void {
    const index = this.#graphs.indexOf(modelOf(graph));
    if (index !== -1) {
      this.#graphs.splice(index, 1);
    }
  }
}
