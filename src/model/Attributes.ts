import { DotBase } from '../common';
import { commentOut, indent, joinLines } from '../utils/dot-rendering';
import { ID } from './ID';

/**
 * A set of attribute values for any object.
 *
 * @category Attributes
 */
export class Attributes extends DotBase {
  /** Comments to include when outputting with toDot. */
  public comment?: string;
  /** @hidden */
  protected attrs: Map<string, ID> = new Map();
  /** The size of the attribute. */
  get size(): number {
    return this.attrs.size;
  }

  /** The size of the attribute. */
  public get(key: string): ID | undefined {
    return this.attrs.get(key);
  }
  /** Set a value to the attribute. */
  public set(key: string, value: any): void {
    if (value instanceof ID) {
      this.attrs.set(key, value);
    } else {
      this.attrs.set(key, new ID(value));
    }
  }
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
