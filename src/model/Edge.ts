import { Dot } from './dot';
import { Node } from './Node';
import { EdgeAttributes } from './values/attributes';

export class Edge {
  constructor(
    public readonly graph: Dot,
    public readonly from: Node,
    public readonly to: Node,
    public readonly attributes: EdgeAttributes = new EdgeAttributes(),
  ) {}
}
