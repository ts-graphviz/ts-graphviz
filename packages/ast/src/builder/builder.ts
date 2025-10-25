import type { ASTChildNode, ASTNode, FileRange } from '../types.js';
import type { ASTBuilder, BuilderOptions } from './types.js';

/**
 * Builder is an ASTBuilder that provides a method to create an ASTNode.
 *
 * @group Create AST
 */
export class Builder implements ASTBuilder {
  private nodeCount = 0;
  private maxNodes: number;

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
  constructor(private options?: Partial<BuilderOptions>) {
    this.maxNodes = options?.maxASTNodes ?? 100000;
  }

  /**
   * Create an {@link ASTNode} of the specified type
   *
   * @param type - Type of the {@link ASTNode}
   * @param props - Properties of the {@link ASTNode}
   * @param children - Children of the {@link ASTNode}
   * @returns An {@link ASTNode}
   * @throws Error if the maximum number of AST nodes is exceeded
   */
  public createElement<T extends ASTNode>(
    type: T['type'],
    props: any,
    children: ASTChildNode<T>[] = [],
  ): T {
    if (this.maxNodes > 0) {
      this.nodeCount++;
      if (this.nodeCount > this.maxNodes) {
        throw new Error(
          `AST node count (${this.nodeCount}) exceeds maximum allowed (${this.maxNodes}). ` +
            `Consider increasing 'maxASTNodes' option or simplifying the input.`,
        );
      }
    }
    return {
      location: this.getLocation(),
      ...props,
      type,
      children,
    };
  }

  /**
   * Reset the node count. Used internally by the parser between parse invocations.
   * @internal
   */
  public resetNodeCount(): void {
    this.nodeCount = 0;
  }
}
