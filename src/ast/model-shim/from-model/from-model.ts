import { DotObjectModel } from '../../../common/index.js';
import { FromModelConverter } from './converter.js';
import { ModelToAST, ConvertFromModelOptions } from './types.js';

/**
 * @group Convert Model to AST
 */
export function fromModel<T extends DotObjectModel>(model: T, options?: ConvertFromModelOptions): ModelToAST<T> {
  return new FromModelConverter(options).convert(model);
}
