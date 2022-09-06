import { ConvertContext, ConvertOptions, ConvertPlugin } from './types.js';
import { defaultPlugins } from './plugins/index.js';
import { DotObjectModel } from '../../common/index.js';
import { ModelToAST } from '../types.js';

export class Converter {
  #plugins: ConvertPlugin<DotObjectModel>[] = [...defaultPlugins];

  constructor(private options: ConvertOptions = {}) {}

  public use(plugin: ConvertPlugin<DotObjectModel>): this {
    this.#plugins.unshift(plugin);
    return this;
  }

  public convert<T extends DotObjectModel>(model: T): ModelToAST<T> {
    const plugins = [...this.#plugins];
    const { commentKind = 'Slash' } = this.options;
    const context: ConvertContext = {
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
