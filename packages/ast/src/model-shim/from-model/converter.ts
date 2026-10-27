import {
  type AnyReadonlyDotObjectModel,
  ownOptions,
  withCode,
} from '@ts-graphviz/common';
import { createElementFactory } from '../../builder/create-element.js';
import { defaultPlugins } from './plugins/index.js';
import type {
  ConvertFromModelContext,
  ConvertFromModelOptions,
  ConvertFromModelPlugin,
  ModelToAST,
} from './types.js';

/**
 * FromModelConverter is a class used to convert a model into an ASTNode.
 *
 * It only reads the model, so it takes any model
 * ({@link AnyReadonlyDotObjectModel}): the built-in ones, custom model
 * classes and the read-only views.
 *
 * @group Convert Model to AST
 */
export class FromModelConverter {
  /** @hidden */
  #plugins: ConvertFromModelPlugin<AnyReadonlyDotObjectModel>[] = [
    ...defaultPlugins,
  ];

  constructor(private options: ConvertFromModelOptions = {}) {
    // Own properties only: an inherited one is never an option (#1757).
    this.options = ownOptions(options);
  }

  /**
   * Converts a model into an AST.
   *
   * @param model The model to be converted.
   * @returns The AST generated from the model.
   */
  public convert<T extends AnyReadonlyDotObjectModel>(model: T): ModelToAST<T> {
    const plugins = [...this.#plugins];
    const { commentKind = 'Slash', maxASTNodes } = this.options;
    const createElement = createElementFactory({ maxASTNodes });
    const context: ConvertFromModelContext = {
      commentKind,
      createElement,
      convert<U extends AnyReadonlyDotObjectModel>(m: U): ModelToAST<U> {
        for (const plugin of plugins) {
          if (plugin.match(m)) {
            return plugin.convert(context, m) as ModelToAST<U>;
          }
        }
        throw withCode(
          new Error(
            `No plugin can convert the "${m.$$type}" model to an AST node`,
          ),
          'TSG_ERR_NO_PLUGIN',
        );
      },
    };
    return context.convert(model);
  }
}
