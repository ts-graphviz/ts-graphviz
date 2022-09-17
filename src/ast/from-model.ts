import { DotObjectModel } from '#/lib/common';
import { Converter, ConvertOptions } from './converter/index.js';
import { ModelToAST } from './types.js';

export function fromModel<T extends DotObjectModel>(model: T, options?: ConvertOptions): ModelToAST<T> {
  return new Converter(options).convert(model);
}
