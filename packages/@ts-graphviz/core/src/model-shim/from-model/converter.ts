import { ConvertFromModelContext, ConvertFromModelOptions, ConvertFromModelPlugin } from './types.js';
import { defaultPlugins } from './plugins/index.js';
import { ModelToAST } from './types.js';
import { Model } from '@ts-graphviz/common';

/**
 * FromModelConverter is a class used to convert a {@link Model} into an ASTNode.
 *
 * @group Convert Model to AST
 */
export class FromModelConverter {
  /** @hidden */
  #plugins: ConvertFromModelPlugin<Model>[] = [...defaultPlugins];

  constructor(private options: ConvertFromModelOptions = {}) {}

  /**
   * Converts a Model into an AST.
   *
   * @param model The {@link Model} to be converted.
   * @returns The AST generated from the model.
   */
  public convert<T extends Model>(model: T): ModelToAST<T> {
    const plugins = [...this.#plugins];
    const { commentKind = 'Slash' } = this.options;
    const context: ConvertFromModelContext = {
      commentKind,
      convert<U extends Model>(m: U): ModelToAST<U> {
        for (const plugin of plugins) {
          if (plugin.match(m)) {
            return plugin.convert(context, m) as ModelToAST<U>;
          }
        }
        throw Error();
      },
    };
    return context.convert(model);
  }
}
