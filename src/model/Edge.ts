import { Graph } from './Cluster';
import { Node } from './Node';
import { EdgeAttributes } from './values/attributes';

export class Edge {
  constructor(
    public readonly graph: Graph,
    public readonly from: Node,
    public readonly to: Node,
    public readonly attributes: EdgeAttributes,
  ) {}
}
