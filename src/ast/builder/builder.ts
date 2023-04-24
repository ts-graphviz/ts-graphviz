import type { FileRange, ASTNode, ASTChildNode } from '../types.js';
import { ASTBuilder, BuilderOptions } from './types.js';

/**
 * Builder is an ASTBuilder that provides a method to create an ASTNode.
 *
 * @group Create AST
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public createElement<T extends ASTNode>(type: T['type'], props: any, children: ASTChildNode<T>[] = []): T {
    return {
      location: this.getLocation(),
      ...props,
      type,
      children,
    };
  }
}
