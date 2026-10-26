import { ownOptions } from '../../own-options.js';
import type { ASTNode } from '../../types.js';
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
  constructor(private options: PrintOptions = {}) {
    // Own properties only: an inherited one is never an option.
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
      maxNestingDepth = 100,
    } = this.options;
    const EOL = endOfLine === 'crlf' ? '\r\n' : '\n';
    const PADDING = indentStyle === 'space' ? ' '.repeat(indentSize) : '\t';
    // Each line is indented once, by the depth at which it is printed,
    // instead of every line passing through one indenting step per level.
    const paddings = new Map<number, string>();
    const padding = (depth: number) => {
      let value = paddings.get(depth);
      if (value === undefined) {
        value = PADDING.repeat(depth);
        paddings.set(depth, value);
      }
      return value;
    };
    let depth = 0;
    // Graph and subgraph bodies entered, for the nesting limit.
    let graphDepth = 0;
    const context: PrintContext = {
      directed: true,
      EOL,
      *printChildren(children: ASTNode[]) {
        depth++;
        try {
          yield EOL;
          yield* context.join(children, EOL);
        } finally {
          depth--;
        }
        yield EOL;
      },
      *print(a: ASTNode) {
        const body = a.type === 'Graph' || a.type === 'Subgraph';
        if (body && graphDepth >= maxNestingDepth) {
          throw new RangeError(
            `Nesting depth exceeds maximum allowed depth of ${maxNestingDepth}. ` +
              `Consider increasing the 'maxNestingDepth' option.`,
          );
        }
        for (const plugin of plugins) {
          if (plugin.match(a)) {
            if (body) graphDepth++;
            try {
              yield* plugin.print(this, a);
            } finally {
              if (body) graphDepth--;
            }
            return;
          }
        }
        throw new TypeError(
          `No matching plugin found for AST node of type ${JSON.stringify(String((a as { type?: unknown })?.type))}.`,
        );
      },
      *join(array: ASTNode[], separator: string) {
        const childrenLength = array.length;
        for (let i = 0; i < childrenLength; i++) {
          yield* context.print(array[i]);
          if (i < childrenLength - 1) {
            yield separator;
          }
        }
      },
    };
    return {
      [Symbol.iterator]: function* () {
        for (const token of context.print(ast)) {
          yield token;
          // `depth` is the depth of the line this line break starts.
          if (token === EOL && depth > 0) {
            yield padding(depth);
          }
        }
      },
    };
  }
}
