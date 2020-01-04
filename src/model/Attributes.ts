import { DotBase } from '../common';
import { commentOut, indent, joinLines } from '../utils/dot-rendering';
import { ID } from './ID';

/**
 * @category Attributes
 */
export class Attributes extends DotBase {
  public comment?: string;
  protected attrs: Map<string, ID> = new Map();
  get size(): number {
    return this.attrs.size;
  }
  public get(key: string): ID | undefined {
    return this.attrs.get(key);
  }
  public set(key: string, value: any): void {
    if (value instanceof ID) {
      this.attrs.set(key, value);
    } else {
      this.attrs.set(key, new ID(value));
    }
  }
  public toDot(): string {
    if (this.size === 0) {
      return '';
    }
    const comment = this.comment ? indent(commentOut(this.comment)) : undefined;
    return joinLines(
      '[',
      comment,
      ...Array.from(this.attrs.entries()).map(([key, value]) => indent(`${key} = ${value.toDot()},`)),
      ']',
    );
  }
}
