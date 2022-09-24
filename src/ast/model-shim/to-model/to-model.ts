import { DotASTNode, GraphASTNode, SubgraphASTNode, NodeASTNode, EdgeASTNode } from '../../types.js';
import { ToModelConverter } from './converter.js';
import { ASTToModel, ConvertToModelOptions } from './types.js';

/**
 * @group Convert AST to Model
 * @beta
 */
export function toModel<T extends DotASTNode | GraphASTNode | SubgraphASTNode | NodeASTNode | EdgeASTNode>(
  ast: T,
  options?: ConvertToModelOptions,
): ASTToModel<T> {
  return new ToModelConverter(options).convert(ast);
}
