import { RootGraph } from './RootGraph.js';

/**
 * DOT object class representing a graph.
 * @group Models
 */
export class Graph extends RootGraph {
  get directed(): boolean {
    return false;
  }
}
