import { RootGraph } from './RootGraph.js';

/**
 * DOT object class representing a graph.
 * @public
 */
export class Graph extends RootGraph {
  get directed(): boolean {
    return false;
  }
}
