import {
  type DotModel,
  type EmptySchema,
  type ModelTypes,
  modelOf,
  type RootGraphModel,
  type Schema,
} from '@ts-graphviz/common';

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

  /** Comments to include when outputting with toDot. */
  public comment?: string;

  readonly #graphs: RootGraphModel<ModelTypes<S>>[];

  constructor(graphs: RootGraphModel<ModelTypes<S>>[] = [], comment?: string) {
    // The models themselves, never objects standing for them (a DSL).
    this.#graphs = graphs.map(modelOf);
    this.comment = comment;
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
