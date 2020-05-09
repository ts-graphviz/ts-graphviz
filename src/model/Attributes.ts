import { IAttributes } from '../types';
import { AttributesBase } from './AttributesBase';

/**
 * A set of attribute values for any object.
 *
 * @category Attributes
 */
export class Attributes<T extends string> extends AttributesBase<T> implements IAttributes<T> {
  /** Comments to include when outputting with toDot. */
  public comment?: string;
}
