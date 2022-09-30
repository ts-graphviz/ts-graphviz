import { DotObjectModel } from '../common/index.js';
import { stringify, fromModel, ConvertFromModelOptions, PrintOptions } from '../ast/index.js';

/**
 * @group Convert Model to DOT
 * @alpha
 */
export interface ToDotOptions {
  convert?: ConvertFromModelOptions;
  print?: PrintOptions;
}

/**
 * Convert Model to DOT string.
 *
 * @group Convert Model to DOT
 *
 * @param model Dot Object Model, like {@link Digraph}, {@link Graph}, {@link Subgraph}, {@link Node}, and {@link Edge}
 * @param options
 * @returns DOT string
 */
export function toDot(model: DotObjectModel, options?: ToDotOptions): string {
  const ast = fromModel(model, options?.convert);
  return stringify(ast, options?.print);
}
