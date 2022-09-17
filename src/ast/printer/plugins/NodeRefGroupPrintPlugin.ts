import { pipe, map } from '../../../utils/index.js';
import { NodeRefGroupASTNode } from '../../types.js';
import { PrintPlugin } from '../types.js';
import { joinBy, wrapByPair } from './utils/index.js';

export const NodeRefGroupPrintPlugin: PrintPlugin<NodeRefGroupASTNode> = {
  match(ast) {
    return ast.type === 'NodeRefGroup';
  },
  print(context, ast): string {
    return pipe(map(context.print), joinBy(' '), wrapByPair('{', '}'))(ast.children);
  },
};
