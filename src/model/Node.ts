import { Graph } from './Cluster';
import { NodeAttributes } from './values/attributes';

export class Node {
  constructor(
    public readonly graph: Graph,
    public readonly id: string,
    public readonly attributes: NodeAttributes = new NodeAttributes(),
  ) { }
}
