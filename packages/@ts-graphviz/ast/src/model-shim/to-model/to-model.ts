import { ToModelConverter } from './converter.js';
import { ASTToModel, ToModelConvertableASTNode, ConvertToModelOptions } from './types.js';

/**
 * @group Convert AST to Model
 */
export function toModel<T extends ToModelConvertableASTNode>(ast: T, options?: ConvertToModelOptions): ASTToModel<T> {
  return new ToModelConverter(options).convert(ast);
}
