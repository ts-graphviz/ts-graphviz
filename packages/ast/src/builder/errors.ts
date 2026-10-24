/**
 * Error thrown when the AST node count exceeds the maximum allowed limit.
 * This error is thrown during parsing to prevent memory exhaustion attacks.
 *
 * A `RangeError` with `code` `TSG_ERR_AST_NODE_COUNT_EXCEEDED`.
 *
 * @group Create AST
 */
export class ASTNodeCountExceededError extends RangeError {
  override readonly name = 'ASTNodeCountExceededError';
  readonly code = 'TSG_ERR_AST_NODE_COUNT_EXCEEDED';

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
