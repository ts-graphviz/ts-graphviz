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
  protected static quoteString(src: string): string {
    return `"${src}"`;
  }

  protected static joinLines(...lines: (string | undefined)[]): string {
    return lines.filter(l => typeof l === 'string').join('\n');
  }

  protected static indent(src: string, depth: number = 1): string {
    const indent = ' '.repeat(2 * depth);
    return src
      .split('\n')
      .map(l => `${indent}${l}`)
      .join('\n');
  }

  public abstract toDot(): string;
}
