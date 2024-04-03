import type { DotObjectModel } from '@ts-graphviz/common';
import { FromModelConverter } from './converter.js';
import type { ConvertFromModelOptions, ModelToAST } from './types.js';

/**
 * A function used to convert a DotObjectModel into an AST.
 *
 * @param model - The {@link @ts-graphviz/common#DotObjectModel} to be converted.
 * @param options - An optional {@link ConvertFromModelOptions} object.
 * @returns ModelToAST - The AST representation of the {@link @ts-graphviz/common#DotObjectModel}.
 * @public
 */
export function fromModel<T extends DotObjectModel>(
  model: T,
  options?: ConvertFromModelOptions,
): ModelToAST<T> {
  return new FromModelConverter(options).convert(model);
}
