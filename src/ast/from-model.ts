import { Model } from '../common/index.js';
import { Converter, ConvertOptions } from './converter/index.js';
import { ModelToAST } from './types.js';

export function fromModel<T extends Model>(model: T, options?: ConvertOptions): ModelToAST<T> {
  return new Converter(options).convert(model);
}
