import { wrap } from 'jest-snapshot-serializer-raw';
import { DotObjectModel, toDot as _toDot, ToDotOptions } from '../../src/index.js';
import { stringify as _stringify, SerializeOptions, ASTNode } from '../../src//ast/index.js';

export function toDot(model: DotObjectModel, options?: ToDotOptions) {
  return wrap(_toDot(model, options));
}

export function stringify(ast: ASTNode, options?: SerializeOptions) {
  return wrap(_stringify(ast, options));
}
