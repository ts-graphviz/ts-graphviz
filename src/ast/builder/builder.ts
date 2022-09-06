import type { FileRange, ASTNode, ASTChildNode } from '../types.js';
import { ASTBuilder, BuilderOptions } from './types.js';

export class Builder implements ASTBuilder {
  private getLocation(): FileRange | null {
    return this.options?.locationFunction?.() ?? null;
  }

  constructor(private options?: Partial<BuilderOptions>) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public createElement<T extends ASTNode>(type: T['type'], props: any, children: ASTChildNode<T>[]): T {
    return {
      ...props,
      type,
      location: this.getLocation(),
      children,
    };
  }
}
