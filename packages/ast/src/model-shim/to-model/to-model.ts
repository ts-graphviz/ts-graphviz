import { ToModelConverter } from './converter.js';
import type {
  ASTToModel,
  ConvertToModelOptions,
  ToModelConvertableASTNode,
} from './types.js';

/**
 * A function used to convert an AST into a {@link @ts-graphviz/common#DotObjectModel}.
 * @public
 */
export function toModel<T extends ToModelConvertableASTNode>(
  ast: T,
  options?: ConvertToModelOptions,
): ASTToModel<T> {
  return new ToModelConverter(options).convert(ast);
}
