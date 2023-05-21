import { Model } from '@ts-graphviz/common';
import { FromModelConverter } from './converter.js';
import { ModelToAST, ConvertFromModelOptions } from './types.js';

/**
 * A function used to convert a Model into an AST.
 *
 * @param model - The {@link Model} to be converted.
 * @param options - An optional {@link ConvertFromModelOptions} object.
 * @returns ModelToAST - The AST representation of the {@link Model}.
 *
 * @group Convert Model to AST
 */
export function fromModel<T extends Model>(model: T, options?: ConvertFromModelOptions): ModelToAST<T> {
  return new FromModelConverter(options).convert(model);
}
