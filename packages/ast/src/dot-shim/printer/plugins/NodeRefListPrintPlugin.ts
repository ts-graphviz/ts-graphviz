import type { NodeRefListASTNode } from '../../../types.js';
import type { PrintPlugin } from '../types.js';

export const NodeRefListPrintPlugin: PrintPlugin<NodeRefListASTNode> = {
  match(ast) {
    return ast.type === 'NodeRefList';
  },
  *print(context, ast) {
    yield* context.join(ast.refs, ', ');
  },
};
