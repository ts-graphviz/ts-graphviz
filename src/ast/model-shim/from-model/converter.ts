import { DotObjectModel } from '#lib/common';
import { ConvertFromModelContext, ConvertFromModelOptions, ConvertFromModelPlugin } from './types.js';
import { defaultPlugins } from './plugins/index.js';
import { ModelToAST } from './types.js';

/**
 * @group Convert Model to AST
 */
export class FromModelConverter {
  /** @hidden */
  #plugins: ConvertFromModelPlugin<DotObjectModel>[] = [...defaultPlugins];

  constructor(private options: ConvertFromModelOptions = {}) {}

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
