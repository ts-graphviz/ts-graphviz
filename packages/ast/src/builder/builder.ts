import type { ASTChildNode, ASTNode, FileRange } from '../types.js';
import { ASTNodeCountExceededError } from './errors.js';
import type { ASTBuilder, BuilderOptions } from './types.js';

/**
 * Default maximum number of AST nodes that can be created during parsing.
 * This limit prevents memory exhaustion from inputs with excessive elements.
 */
const DEFAULT_MAX_AST_NODES = 100_000;

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
    this.maxNodes = options?.maxASTNodes ?? DEFAULT_MAX_AST_NODES;
  }

  /**
   * Create an {@link ASTNode} of the specified type
   *
   * @param type - Type of the {@link ASTNode}
   * @param props - Properties of the {@link ASTNode}
   * @param children - Children of the {@link ASTNode}
   * @returns An {@link ASTNode}
   * @throws {ASTNodeCountExceededError} if the maximum number of AST nodes is exceeded
   */
  public createElement<T extends ASTNode>(
    type: T['type'],
    props: any,
    children: ASTChildNode<T>[] = [],
  ): T {
    // Always increment node count
    this.nodeCount++;
    if (this.maxNodes > 0 && this.nodeCount > this.maxNodes) {
      throw new ASTNodeCountExceededError(this.nodeCount, this.maxNodes);
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
