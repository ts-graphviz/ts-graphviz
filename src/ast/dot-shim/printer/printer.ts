import type { ASTNode } from '../../types.js';
import { defaultPlugins } from './plugins/index.js';
import type { PrintContext, PrintPlugin, PrintOptions } from './types.js';

/**
 * Printer is a class responsible for converting an AST into a DOT string.
 * @group Convert AST to DOT
 */
export class Printer {
  /** @internal */
  #plugins: PrintPlugin[] = [...defaultPlugins];

  /**
   * @param options Options to be used when generating the DOT string.
   */
  constructor(private options: PrintOptions = {}) {}

  /**
   * Generates a DOT string from an ASTNode.
   * @param ast The ASTNode to be converted into a DOT string.
   * @returns The DOT string generated from the ASTNode.
   */
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
