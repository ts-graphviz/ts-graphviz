import { RootGraphModel } from './common/index.js';
import { convertToAST } from './ast/index.js';
import { stringify } from './ast/index.js';

export function toDot(object: RootGraphModel): string {
  const ast = convertToAST(object);
  return stringify(ast);
}
