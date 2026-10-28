import type {
  DotModel,
  EmptySchema,
  ModelTypes,
  RootGraphModel,
  Schema,
} from '@ts-graphviz/common';
import { DotObject } from './DotObject.js';

/**
 * Model of a whole DOT source: the root graphs it contains and the comments
 * that are not attached to a graph.
 *
 * It is the model counterpart of the `Dot` AST node.
 *
 * @typeParam S - The schema of its root graphs; none by default.
 * @group Models
 */
export class Dot<S extends Schema = EmptySchema>
  extends DotObject
  implements DotModel<S>
{
  public get $$type(): 'Dot' {
    return 'Dot';
  }

  /** Comments to include when outputting with toDot. */
  public comment?: string;

  readonly #graphs: RootGraphModel<ModelTypes<S>>[];

  constructor(graphs: RootGraphModel<ModelTypes<S>>[] = [], comment?: string) {
    super();
    this.#graphs = [...graphs];
    this.comment = comment;
  }

  get graphs(): ReadonlyArray<RootGraphModel<ModelTypes<S>>> {
    return this.#graphs;
  }

  public addGraph(graph: RootGraphModel<ModelTypes<S>>): void {
    if (!this.existGraph(graph)) {
      this.#graphs.push(graph);
    }
  }

  public existGraph(graph: RootGraphModel<ModelTypes<S>>): boolean {
    return this.#graphs.includes(graph);
  }

  public removeGraph(graph: RootGraphModel<ModelTypes<S>>): void {
    const index = this.#graphs.indexOf(graph);
    if (index !== -1) {
      this.#graphs.splice(index, 1);
    }
  }
}
