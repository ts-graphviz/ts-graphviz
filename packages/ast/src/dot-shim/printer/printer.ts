import { withCode } from '@ts-graphviz/common';
import type { ASTNode, CommentASTNode } from '../../types.js';
import { defaultPlugins } from './plugins/index.js';
import { escapeComment } from './plugins/utils/escape-comment.js';
import type { PrintContext, PrintOptions, PrintPlugin } from './types.js';

/** Nodes whose plugin writes their dangling comments in the header. */
const HEADER_DANGLING = new Set(['Graph', 'Subgraph', 'AttributeList']);

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
      *printComments(comments, placement) {
        // A leading comment comes after a node on an earlier line, so it is
        // written on lines of its own: written after that node on its line,
        // it would be read back as that node's trailing comment.
        if (placement === 'leading' && comments?.length) yield EOL;
        for (const comment of comments ?? []) {
          if (placement === 'trailing') yield ' ';
          const lines = escapeComment(comment.value, comment.kind).split(
            /\r?\n/,
          );
          if (comment.kind === 'Block') {
            yield '/* ';
            yield* lines.flatMap((line, i) => (i === 0 ? [line] : [EOL, line]));
            yield ' */';
            yield placement === 'leading'
              ? EOL
              : placement === 'inline'
                ? ' '
                : '';
          } else {
            // A line comment runs to the end of the line, so the line ends
            // after it, whatever follows.
            const marker = comment.kind === 'Slash' ? '//' : '#';
            for (const line of lines) {
              yield line === '' ? marker : `${marker} ${line}`;
              yield EOL;
            }
          }
        }
      },
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
            yield* context.printComments(a.leadingComments, 'leading');
            yield* plugin.print(this, a);
            yield* context.printComments(a.trailingComments, 'trailing');
            if (!HEADER_DANGLING.has(a.type)) {
              yield* context.printComments(a.danglingComments, 'trailing');
            }
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
