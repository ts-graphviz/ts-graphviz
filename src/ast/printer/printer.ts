import type { ASTNode } from '../types.js';
import { defaultPlugins } from './plugins/index.js';
import type { PrintContext, PrintPlugin, StringifyOptions } from './types.js';

export class Printer {
  #plugins: PrintPlugin[] = [...defaultPlugins];

  constructor(private options: StringifyOptions = {}) {}

  public use(plugin: PrintPlugin): this {
    this.#plugins.unshift(plugin);
    return this;
  }

  public print(ast: ASTNode): string {
    const plugins = this.#plugins;
    const { indentSize = 2, indentStyle = 'space', endOfLine = 'lf' } = this.options;
    const context: PrintContext = {
      directed: true,
      indentSize,
      indentStyle,
      endOfLine,
      print(ast: ASTNode): string {
        for (const plugin of plugins) {
          if (plugin.match(ast)) {
            return plugin.print(context, ast);
          }
        }
        throw Error();
      },
    };
    return context.print(ast);
  }
}
