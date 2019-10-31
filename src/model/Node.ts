import { GraphType } from "./Cluster";

export class Node {
  constructor(
    public readonly graph: GraphType,
    public readonly id: string,
  ) { }
}
