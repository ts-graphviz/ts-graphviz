import { RootGraph } from './RootGraph.js';

/**
 * DOT object class representing a digraph.
 * @public
 */
export class Digraph extends RootGraph {
  public get directed(): boolean {
    return true;
  }
}
