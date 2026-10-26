import { ownOptions, withCode } from '@ts-graphviz/common';
import { ownField } from '../../own-field.js';
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
  #plugins: PrintPlugin[] = [...defaultPlugins];

  /**
   * @param options Options to be used when generating the DOT string.
   */
  constructor(private options: PrintOptions = {}) {
    // Own properties only: an inherited one is never an option (#1757).
    this.options = ownOptions(options);
  }

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
    return {
      // Each iteration prints with state of its own.
      [Symbol.iterator]: function* () {
        // Indentation is written by the loop below, which sees every token: a
        // line gets one PADDING per `printChildren` it is in, when its first
        // token comes (so a blank line stays empty).
        let level = 0;
        let lineStart = false;
        const paddings: string[] = [''];
        const padding = () => {
          while (paddings.length <= level) {
            paddings.push(paddings[paddings.length - 1] + PADDING);
          }
          return paddings[level];
        };
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
              // Every line break, a lone CR included, as CommentPrintPlugin
              // splits a comment statement.
              const lines = escapeComment(comment.value, comment.kind).split(
                /\r\n|\r|\n/,
              );
              if (comment.kind === 'Block') {
                yield '/* ';
                yield* lines.flatMap((line, i) =>
                  i === 0 ? [line] : [EOL, line],
                );
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
            level++;
            yield EOL;
            yield* context.join(children, EOL);
            // A line left open at the end is indented as if something followed.
            if (lineStart) yield '';
            level--;
            yield EOL;
          },
          print(a: ASTNode) {
            // Not printed here: handed to the loop below, which prints the node
            // with a stack of its own. Nested generators would pass every token
            // through one frame per level, and deep nesting would run out of
            // call stack.
            return [new Nested(a)] as unknown as Iterable<string>;
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
        function* printNode(a: ASTNode): Generator<string> {
          for (const plugin of plugins) {
            if (plugin.match(a)) {
              yield* context.printComments(
                ownField(a, 'leadingComments'),
                'leading',
              );
              yield* plugin.print(context, a);
              yield* context.printComments(
                ownField(a, 'trailingComments'),
                'trailing',
              );
              if (!HEADER_DANGLING.has(a.type)) {
                yield* context.printComments(
                  ownField(a, 'danglingComments'),
                  'trailing',
                );
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
        }
        // The nodes being printed, innermost last; each token is handled
        // once, whatever the depth, so printing is linear in the output.
        const stack: Iterator<string | Nested>[] = [printNode(ast)];
        while (stack.length > 0) {
          const step = stack[stack.length - 1].next();
          if (step.done) {
            stack.pop();
          } else if (step.value instanceof Nested) {
            stack.push(printNode(step.value.node));
          } else {
            const token = step.value;
            if (lineStart && token !== EOL) yield padding();
            yield token;
            lineStart = token === EOL;
          }
        }
      },
    };
  }
}

/** A node to print, passed from `context.print` to the printing loop. */
class Nested {
  constructor(readonly node: ASTNode) {}
}

function isLineComment(
  node: ASTNode,
): node is CommentASTNode & { kind: 'Slash' | 'Macro' } {
  return (
    node.type === 'Comment' && (node.kind === 'Slash' || node.kind === 'Macro')
  );
}
