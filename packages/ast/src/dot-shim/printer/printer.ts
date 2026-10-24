import { withCode } from '@ts-graphviz/common';
import type { ASTNode, CommentASTNode } from '../../types.js';
import { defaultPlugins } from './plugins/index.js';
import type { PrintContext, PrintOptions, PrintPlugin } from './types.js';

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
    return Array.from(this.toChunks(ast)).join('');
  }

  private toChunks(ast: ASTNode): Iterable<string> {
    const plugins = [...this.#plugins];
    const {
      indentSize = 2,
      indentStyle = 'space',
      endOfLine = 'lf',
    } = this.options;
    const EOL = endOfLine === 'crlf' ? '\r\n' : '\n';
    const PADDING = indentStyle === 'space' ? ' '.repeat(indentSize) : '\t';
    const context: PrintContext = {
      directed: true,
      EOL,
      *printChildren(children: ASTNode[]) {
        yield* indent(function* () {
          yield EOL;
          yield* context.join(children, EOL);
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
        throw withCode(
          new Error(
            `No matching plugin found for AST node: ${JSON.stringify(a)}`,
          ),
          'TSG_ERR_NO_PLUGIN',
        );
      },
      *join(array: ASTNode[], separator: string) {
        const childrenLength = array.length;
        for (let i = 0; i < childrenLength; i++) {
          yield* context.print(array[i]);
          if (i < childrenLength - 1) {
            yield separator;
            // Consecutive `//` or `#` lines read as one comment, so two
            // separate line comments of the same kind need a blank line
            // between them to stay two comments.
            const current = array[i];
            const next = array[i + 1];
            if (
              separator === EOL &&
              isLineComment(current) &&
              isLineComment(next) &&
              current.kind === next.kind
            ) {
              yield EOL;
            }
          }
        }
      },
    };
    return {
      [Symbol.iterator]: function* () {
        yield* context.print(ast);
      },
    };
    function* indent(
      tokens: () => IterableIterator<string>,
    ): IterableIterator<string> {
      // Indent a line when its first token comes, so a blank line stays
      // empty (no trailing whitespace).
      let lineStart = false;
      for (const token of tokens()) {
        if (lineStart && token !== EOL) {
          yield PADDING;
        }
        yield token;
        lineStart = token === EOL;
      }
      if (lineStart) {
        yield PADDING;
      }
    }
  }
}

function isLineComment(
  node: ASTNode,
): node is CommentASTNode & { kind: 'Slash' | 'Macro' } {
  return (
    node.type === 'Comment' && (node.kind === 'Slash' || node.kind === 'Macro')
  );
}
