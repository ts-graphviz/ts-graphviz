import type { ASTNode } from '../../types.js';
import { defaultPlugins } from './plugins/index.js';
import type { PrintContext, PrintPlugin, PrintOptions } from './types.js';

/**
 * @group Convert AST to DOT
 */
export class Printer {
  /** @internal */
  #plugins: PrintPlugin[] = [...defaultPlugins];

  constructor(private options: PrintOptions = {}) {}

  public print(ast: ASTNode): string {
    const plugins = [...this.#plugins];
    const { indentSize = 2, indentStyle = 'space', endOfLine = 'lf' } = this.options;
    const context: PrintContext = {
      directed: true,
      indentSize,
      indentStyle,
      endOfLine,
      print(a: ASTNode): string {
        for (const plugin of plugins) {
          if (plugin.match(a)) {
            return plugin.print(context, a);
          }
        }
        throw Error();
      },
    };
    return context.print(ast);
  }
}
