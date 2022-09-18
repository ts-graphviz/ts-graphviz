import { DotObjectModel } from '#lib/common';
import { stringify, fromModel, PrintOptions, ConvertOptions } from '#lib/ast';

export interface ToDotOptions {
  convert?: ConvertOptions;
  print?: PrintOptions;
}

export function toDot(model: DotObjectModel, options?: ToDotOptions): string {
  const ast = fromModel(model, options?.convert);
  return stringify(ast, options?.print);
}
