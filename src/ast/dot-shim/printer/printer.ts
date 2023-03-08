import type { ASTNode } from '../../types.js';
import { defaultPlugins } from './plugins/index.js';
import { EOL, PrintContext, PrintPlugin, PrintOptions, Doc } from './types.js';

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

  public stream(ast: ASTNode): Iterable<string> {
    const plugins = [...this.#plugins];
    let indentLevel = 0;
    const { indentSize = 2, indentStyle = 'space', endOfLine = 'lf' } = this.options;
    const eol = endOfLine === 'crlf' ? '\r\n' : '\n';
    function* indent(tokens: () => Generator<Doc>): Generator<string> {
      const padding = (indentStyle === 'space' ? ' ' : '\t').repeat(++indentLevel * indentSize);
      const tokenIter = tokens();
      let next = tokenIter.next();
      while (true) {
        if (next.value === EOL) {
          yield eol;
          yield padding;
        } else {
          yield next.value;
        }
        next = tokenIter.next();
        if (next.done) {
          break;
        }
      }
      indentLevel--;
    }

    const context: PrintContext = {
      directed: true,
      *printChildren(children: ASTNode[]) {
        yield* indent(function* () {
          yield EOL;
          const iter = children[Symbol.iterator]();
          let next = iter.next();
          while (true) {
            yield* context.print(next.value);
            next = iter.next();
            if (!next.done) {
              yield EOL;
            } else {
              break;
            }
          }
        });
        yield EOL;
      },
      *print(a: ASTNode) {
        for (const plugin of plugins) {
          if (plugin.match(a)) {
            yield* plugin.print(this, a);
            return;
          }
        }
        throw Error();
      },
    };
    return {
      [Symbol.iterator]: function* () {
        for (const token of context.print(ast)) {
          if (token === EOL) {
            yield eol;
          } else {
            yield token;
          }
        }
      },
    };
  }

  /**
   * Generates a DOT string from an ASTNode.
   * @param ast The ASTNode to be converted into a DOT string.
   * @returns The DOT string generated from the ASTNode.
   */
  public print(ast: ASTNode): string {
    return Array.from(this.stream(ast)).join('');
  }
}
