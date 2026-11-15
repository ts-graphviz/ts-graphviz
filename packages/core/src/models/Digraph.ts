import type { EmptySchema, Schema } from '@ts-graphviz/common';
import { RootGraph } from './RootGraph.js';

/**
 * DOT object class representing a digraph.
 *
 * @typeParam S - The schema of the graph, which types its attributes and
 * the models it holds; none by default.
 * @group Models
 */
export class Digraph<S extends Schema = EmptySchema> extends RootGraph<S> {
  public get directed(): boolean {
    return true;
  }
}
