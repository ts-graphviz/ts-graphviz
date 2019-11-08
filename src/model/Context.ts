import { Digraph, Graph, RootClusterType } from './cluster';

export interface IContext {
  graphType: RootClusterType;
}

export class Context implements IContext {
  get graphType(): RootClusterType {
    return this.root.type;
  }
  constructor(public readonly root: Graph | Digraph) {}
}
