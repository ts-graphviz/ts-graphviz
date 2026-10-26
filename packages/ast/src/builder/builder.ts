import { ownOptions } from '@ts-graphviz/common';
import type { ASTChildNode, ASTNode, FileRange } from '../types.js';
import { ASTNodeCountExceededError } from './errors.js';
import type { ASTBuilder, BuilderOptions } from './types.js';

/**
 * Default maximum number of AST nodes that can be created during parsing.
 * This limit prevents memory exhaustion from inputs with excessive elements.
 */
const DEFAULT_MAX_AST_NODES = 100_000;

/** Node types without a `children` list. */
const LEAF_TYPES: ReadonlySet<ASTNode['type']> = new Set([
  'Literal',
  'Attribute',
  'Comment',
  'NodeRef',
]);

/**
 * Builder is an ASTBuilder that provides a method to create an ASTNode.
 *
 * @group Create AST
 */
export class Builder implements ASTBuilder {
  private nodeCount = 0;
  private maxNodes: number;

  /**
   * Get the current file range, or undefined outside the parser
   * @internal
   */
  private getLocation(): FileRange | undefined {
    return this.options?.locationFunction?.();
  }

  /**
   * Constructor of Builder
   * @param options - Options to initialize Builder
   */
  constructor(private options?: Partial<BuilderOptions> | undefined) {
    // Own properties only: an inherited one is never an option (#1757).
    this.options = ownOptions(options);
    this.maxNodes = this.options.maxASTNodes ?? DEFAULT_MAX_AST_NODES;
  }

  /**
   * Create an {@link ASTNode} of the specified type
   *
   * @param type - Type of the {@link ASTNode}
   * @param props - Properties of the {@link ASTNode}
   * @param children - The nodes the new node contains: the `children` of a
   * statement container, the `refs` of a `NodeRefList`; ignored for leaves.
   * @returns An {@link ASTNode}
   * @throws {ASTNodeCountExceededError} if the maximum number of AST nodes is exceeded
   */
  public createElement<T extends ASTNode>(
    type: T['type'],
    props: any,
    children: ASTChildNode<T>[] = [],
  ): T {
    this.countNode();
    const location = this.getLocation();
    // The contained nodes come from the third argument only, never from props.
    // Own properties only (a spread copies no inherited ones).
    const rest = { ...props };
    delete rest.children;
    delete rest.refs;
    const node = { ...(location && { location }), ...rest, type };
    if (type === 'NodeRefList') {
      return { ...node, refs: children };
    }
    if (LEAF_TYPES.has(type)) {
      return node;
    }
    return { ...node, children };
  }

  /**
   * Count a node made outside {@link Builder.createElement} (a comment the
   * parser attaches after parsing) toward `maxASTNodes`.
   * @throws {ASTNodeCountExceededError} if the maximum number of AST nodes is exceeded
   * @internal
   */
  public countNode(): void {
    this.nodeCount++;
    if (this.maxNodes > 0 && this.nodeCount > this.maxNodes) {
      throw new ASTNodeCountExceededError(this.nodeCount, this.maxNodes);
    }
  }

  /**
   * Reset the node count. Used internally by the parser between parse invocations.
   * @internal
   */
  public resetNodeCount(): void {
    this.nodeCount = 0;
  }
}
