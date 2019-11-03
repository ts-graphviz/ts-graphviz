import { Dot } from './Dot';
import { NodeAttributes } from './values/attributes';

export class Node {
  constructor(
    public readonly graph: Dot,
    public readonly id: string,
    public readonly attributes: NodeAttributes = new NodeAttributes(),
  ) {}
}
