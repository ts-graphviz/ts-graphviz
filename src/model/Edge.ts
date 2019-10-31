import { Node } from "./Node";
import { EdgeAttributes } from "./values/attributes";
import { Graph } from "./Cluster";

export class Edge {
  constructor(
    public readonly graph: Graph,
    public readonly from: Node,
    public readonly to: Node,
    public readonly attributes: EdgeAttributes,
  ) {}
}
