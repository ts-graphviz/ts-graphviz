import type { NodeRefGroupASTNode } from '../../../types.js';
import type { PrintPlugin } from '../types.js';

export const NodeRefGroupPrintPlugin: PrintPlugin<NodeRefGroupASTNode> = {
  match(ast) {
    return ast.type === 'NodeRefGroup';
  },
  *print(context, ast) {
    yield '{';
    yield* context.join(ast.children, ' ');
    yield '}';
  },
};
