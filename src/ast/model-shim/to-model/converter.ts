import { createModelsContext } from '#lib/common';
import { DotASTNode, EdgeASTNode, GraphASTNode, NodeASTNode, SubgraphASTNode } from '../../types.js';
import { defaultPlugins } from './plugins/index.js';
import { ASTToModel, ConvertToModelContext, ConvertToModelOptions, ConvertToModelPlugin } from './types.js';

/**
 * @group Convert AST to Model
 * @alpha
 */
export class ToModelConverter {
  /** @hidden */
  #plugins: ConvertToModelPlugin<DotASTNode | GraphASTNode | SubgraphASTNode | NodeASTNode | EdgeASTNode>[] = [
    ...defaultPlugins,
  ];

  constructor(private options: ConvertToModelOptions = {}) {}

  /**
   * Convert AST to Model.
   *
   * @param ast AST node.
   *
   * @alpha May change the publishing method.
   */
  public convert<T extends DotASTNode | GraphASTNode | SubgraphASTNode | NodeASTNode | EdgeASTNode>(
    ast: T,
  ): ASTToModel<T> {
    const plugins = [...this.#plugins];
    const context: ConvertToModelContext = {
      models: createModelsContext(this.options.models ?? {}),
      convert<U extends DotASTNode | GraphASTNode | SubgraphASTNode | NodeASTNode | EdgeASTNode>(m: U): ASTToModel<U> {
        for (const plugin of plugins) {
          if (plugin.match(m)) {
            return plugin.convert(context, m) as ASTToModel<U>;
          }
        }
        throw Error();
      },
    };
    return context.convert(ast);
  }
}
