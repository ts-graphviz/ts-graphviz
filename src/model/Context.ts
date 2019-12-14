import { Digraph, Graph, RootClusterType, Subgraph } from './cluster';

export interface IContext {
  graphType: RootClusterType;
}

export class Context implements IContext {
  get graphType(): RootClusterType {
    return this.root.type;
  }
  constructor(public readonly root: Graph | Digraph) {}

  public createSubgraph(id: string): Subgraph {
    return new Subgraph(this, id);
  }
}
