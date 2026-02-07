import type { DotObjectModel } from '@ts-graphviz/common';
import { createElementFactory } from '../../builder/create-element.js';
import { defaultPlugins } from './plugins/index.js';
import type {
  ConvertFromModelContext,
  ConvertFromModelOptions,
  ConvertFromModelPlugin,
  ModelToAST,
} from './types.js';

/**
 * FromModelConverter is a class used to convert a {@link DotObjectModel} into an ASTNode.
 *
 * @group Convert Model to AST
 */
export class FromModelConverter {
  /** @hidden */
  #plugins: ConvertFromModelPlugin<DotObjectModel>[] = [...defaultPlugins];

  constructor(private options: ConvertFromModelOptions = {}) {}

  /**
   * Converts a DotObjectModel into an AST.
   *
   * @param model The {@link DotObjectModel} to be converted.
   * @returns The AST generated from the model.
   */
  public convert<T extends DotObjectModel>(model: T): ModelToAST<T> {
    const plugins = [...this.#plugins];
    const { commentKind = 'Slash', maxASTNodes } = this.options;
    const createElement = createElementFactory({ maxASTNodes });
    const context: ConvertFromModelContext = {
      commentKind,
      createElement,
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
