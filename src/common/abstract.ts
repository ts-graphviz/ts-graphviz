import { IDot } from '../common';
// tslint:disable: max-classes-per-file

/**
 * @category Base
 */
export abstract class GraphvizObject {}

/**
 * @category Base
 */
export abstract class DotBase extends GraphvizObject implements IDot {
  public abstract toDot(): string;
}
