import { map, pipe } from '@ts-graphviz/common';
import type { NodeRefGroupASTNode } from '../../../types.js';
import type { PrintPlugin } from '../types.js';
import { joinBy, wrapByPair } from './utils/index.js';

export const NodeRefGroupPrintPlugin: PrintPlugin<NodeRefGroupASTNode> = {
  match(ast) {
    return ast.type === 'NodeRefGroup';
  },
  print(context, ast): string {
    return pipe(
      map(context.print),
      joinBy(' '),
      wrapByPair('{', '}'),
    )(ast.children);
  },
};
