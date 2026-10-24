import type { DotModel, RootGraphModel } from '@ts-graphviz/common';
import { DotObject } from './DotObject.js';

/**
 * Model of a whole DOT source: the root graphs it contains and the comments
 * that are not attached to a graph.
 *
 * It is the model counterpart of the `Dot` AST node.
 *
 * @group Models
 */
export class Dot extends DotObject implements DotModel {
  public get $$type(): 'Dot' {
    return 'Dot';
  }

  /** Comments to include when outputting with toDot. */
  public comment?: string;

  readonly #graphs: RootGraphModel[];

  constructor(graphs: RootGraphModel[] = [], comment?: string) {
    super();
    this.#graphs = [...graphs];
    this.comment = comment;
  }

  get graphs(): ReadonlyArray<RootGraphModel> {
    return this.#graphs;
  }

  public addGraph(graph: RootGraphModel): void {
    if (!this.existGraph(graph)) {
      this.#graphs.push(graph);
    }
  }

  public existGraph(graph: RootGraphModel): boolean {
    return this.#graphs.includes(graph);
  }

  public removeGraph(graph: RootGraphModel): void {
    const index = this.#graphs.indexOf(graph);
    if (index !== -1) {
      this.#graphs.splice(index, 1);
    }
  }
}
