import {
  type CommonParseOptions,
  parseFragment,
} from '../dot-shim/parser/index.js';
import { stringify } from '../dot-shim/printer/stringify.js';
import type { PrintOptions } from '../dot-shim/printer/types.js';
import type { DotASTNode } from '../types.js';

/**
 * A step of a {@link Pipeline}. It reads the AST of a DOT source and may
 * change it in place, return a replacement, or throw.
 *
 * @internal
 */
export type Transformer = (ast: DotASTNode) => DotASTNode | undefined;

/**
 * Options of a {@link Pipeline}.
 *
 * @internal
 */
export interface PipelineOptions {
  parse?: CommonParseOptions;
  print?: PrintOptions;
}

/**
 * DOT text → AST → transformers, in order → DOT text, in the manner of
 * unified. The output is always printed from the AST the transformers saw,
 * never copied from the input, so what a transformer checked is what a DOT
 * reader gets.
 *
 * @internal
 */
export class Pipeline {
  private readonly transformers: Transformer[] = [];

  constructor(private readonly options: PipelineOptions = {}) {}

  /** Add a transformer, run after the ones added before it. */
  use(transformer: Transformer): this {
    this.transformers.push(transformer);
    return this;
  }

  /** Run the transformers on an AST. */
  run(ast: DotASTNode): DotASTNode {
    let current = ast;
    for (const transformer of this.transformers) {
      current = transformer(current) ?? current;
    }
    return current;
  }

  /** Parse a DOT source, run the transformers and print the result. */
  process(source: string): string {
    const ast = parseFragment(source, 'Dot', this.options.parse);
    return stringify(this.run(ast), this.options.print);
  }
}
