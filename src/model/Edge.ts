import { Node } from "./Node";
import { EdgeAttributes } from "./values/attributes";
import { GraphType } from "./Cluster";

export class Edge {
  constructor(
    public readonly graph: GraphType,
    public readonly from: Node,
    public readonly to: Node,
    public readonly attributes: EdgeAttributes,
  ) {}
}
