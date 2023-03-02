import { DotObjectModel } from '../../../common/index.js';
import { FromModelConverter } from './converter.js';
import { ModelToAST, ConvertFromModelOptions } from './types.js';

/**
 * A function used to convert a DotObjectModel into an AST.
 *
 * @param model - The {@link DotObjectModel} to be converted.
 * @param options - An optional {@link ConvertFromModelOptions} object.
 * @returns ModelToAST - The AST representation of the {@link DotObjectModel}.
 *
 * @group Convert Model to AST
 */
export function fromModel<T extends DotObjectModel>(model: T, options?: ConvertFromModelOptions): ModelToAST<T> {
  return new FromModelConverter(options).convert(model);
}
