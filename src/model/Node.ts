import { NodeAttributes } from './attributes';
import { Dot } from './dot';

export class Node {
  constructor(
    public readonly graph: Dot,
    public readonly id: string,
    public readonly attributes: NodeAttributes = new NodeAttributes(),
  ) {}
}
