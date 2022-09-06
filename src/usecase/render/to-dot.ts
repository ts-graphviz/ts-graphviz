import { convertToAST, GraphModel } from '../../model/index.js';
import { stringify } from '../../printer/index.js';

export function toDot(object: GraphModel): string {
  const ast = convertToAST(object);
  return stringify(ast);
}
