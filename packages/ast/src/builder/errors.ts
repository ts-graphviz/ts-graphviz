import { ResourceLimitError } from '@ts-graphviz/common';

/**
 * Error thrown when the AST node count exceeds the maximum allowed limit.
 * This error is thrown during parsing to prevent memory exhaustion attacks.
 *
 * @group Create AST
 */
export class ASTNodeCountExceededError extends ResourceLimitError {
  /**
   * Constructor
   * @param nodeCount - The current node count when the limit was exceeded
   * @param maxNodes - The maximum allowed node count
   */
  constructor(
    public nodeCount: number,
    public maxNodes: number,
  ) {
    super(
      `AST node count (${nodeCount}) exceeds maximum allowed (${maxNodes}). ` +
        `Consider increasing 'maxASTNodes' option or simplifying the input.`,
    );
  }
}
