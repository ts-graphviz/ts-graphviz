import type { DotObjectModel } from '@ts-graphviz/common';
import { defaultPlugins } from './plugins/index.js';
import type {
  ConvertFromModelContext,
  ConvertFromModelOptions,
  ConvertFromModelPlugin,
} from './types.js';
import type { ModelToAST } from './types.js';

/**
 * FromModelConverter is a class used to convert a {@link @ts-graphviz/common#DotObjectModel} into an ASTNode.
 * @beta
 */
export class FromModelConverter {
  /** @internal */
  #plugins: ConvertFromModelPlugin<DotObjectModel>[] = [...defaultPlugins];

  constructor(private options: ConvertFromModelOptions = {}) {}

  /**
   * Converts a DotObjectModel into an AST.
   *
   * @param model - The {@link @ts-graphviz/common#DotObjectModel} to be converted.
   * @returns The AST generated from the model.
   */
  public convert<T extends DotObjectModel>(model: T): ModelToAST<T> {
    const plugins = [...this.#plugins];
    const { commentKind = 'Slash' } = this.options;
    const context: ConvertFromModelContext = {
      commentKind,
      convert<U extends DotObjectModel>(m: U): ModelToAST<U> {
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
