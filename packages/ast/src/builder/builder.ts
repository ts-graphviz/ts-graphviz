import type { ASTChildNode, ASTNode, FileRange } from '../types.js';
import type { ASTBuilder, BuilderOptions } from './types.js';

/**
 * Builder is an ASTBuilder that provides a method to create an ASTNode.
 * @public
 */
export class Builder implements ASTBuilder {
  /**
   * Get the current file range or null
   * @internal
   */
  private getLocation(): FileRange | null {
    return this.options?.locationFunction?.() ?? null;
  }

  /**
   * Constructor of Builder
   * @param options - Options to initialize Builder
   */
  constructor(private options?: Partial<BuilderOptions>) {}

  /**
   * Create an {@link ASTNode} of the specified type
   *
   * @param type - Type of the {@link ASTNode}
   * @param props - Properties of the {@link ASTNode}
   * @param children - Children of the {@link ASTNode}
   * @returns An {@link ASTNode}
   */
  public createElement<T extends ASTNode>(
    type: T['type'],
    props: any,
    children: ASTChildNode<T>[] = [],
  ): T {
    return {
      location: this.getLocation(),
      ...props,
      type,
      children,
    };
  }
}
