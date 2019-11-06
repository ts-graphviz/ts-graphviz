import { NodeAttributes } from './attributes';
import { Dot } from './dot';
import { IDot } from './interface';

export class Node implements IDot {
  constructor(
    public readonly graph: Dot,
    public readonly id: string,
    public readonly attributes: NodeAttributes = new NodeAttributes(),
  ) {}

  public toDot(): string {
    throw new Error('Method not implemented.');
  }
}
