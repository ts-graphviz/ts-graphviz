import type { NodeASTNode } from '../../../types.js';
import type { PrintPlugin } from '../types.js';

export const NodePrintPlugin: PrintPlugin<NodeASTNode> = {
  match(ast) {
    return ast.type === 'Node';
  },
  *print(context, ast) {
    yield* context.print(ast.id);
    if (ast.children.length >= 1) {
      yield ' [';
      yield* context.printChildren(ast.children);
      yield ']';
    }
    yield ';';
  },
};
