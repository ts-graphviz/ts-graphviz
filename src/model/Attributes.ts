import { IAttributes } from '../types';
import { commentOut, indent, joinLines } from '../utils/dot-rendering';
import { AttributesBase } from './AttributesBase';

/**
 * A set of attribute values for any object.
 *
 * @category Attributes
 */
export class Attributes<T extends string> extends AttributesBase<T> implements IAttributes<T> {
  /** Comments to include when outputting with toDot. */
  public comment?: string;

  /** Convert Attributes to Dot language. */
  public toDot(): string {
    if (this.size === 0) {
      return '';
    }
    return joinLines(
      '[',
      indent(
        joinLines(
          this.comment ? commentOut(this.comment) : undefined,
          ...Array.from(this.attrs.entries()).map(([key, value]) => `${key} = ${value.toDot()},`),
        ),
      ),
      ']',
    );
  }
}
