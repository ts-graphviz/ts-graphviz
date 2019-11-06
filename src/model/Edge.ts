import { EdgeAttributes } from './attributes';
import { Dot } from './dot';
import { IDot } from './interface';
import { Node } from './Node';

export class Edge implements IDot {
  constructor(
    public readonly graph: Dot,
    public readonly from: Node,
    public readonly to: Node,
    public readonly attributes: EdgeAttributes = new EdgeAttributes(),
  ) {}
  public toDot(): string {
    throw new Error('Method not implemented.');
  }
}
