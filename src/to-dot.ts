import { convertToAST, RootGraphModel } from './model/index.js';
import { stringify } from './ast/index.js';

export function toDot(object: RootGraphModel): string {
  const ast = convertToAST(object);
  return stringify(ast);
}
