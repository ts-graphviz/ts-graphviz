import { DotObjectModel } from './common/index.js';
import { stringify, fromModel, PrintOptions } from './ast/index.js';
import { ConvertOptions } from './ast/index.js';

export interface ToDotOptions {
  convert?: ConvertOptions;
  print?: PrintOptions;
}

export function toDot(model: DotObjectModel, options?: ToDotOptions): string {
  const ast = fromModel(model, options?.convert);
  return stringify(ast, options?.print);
}
