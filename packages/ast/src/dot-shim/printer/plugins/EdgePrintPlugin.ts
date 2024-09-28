import type { EdgeASTNode } from '../../../types.js';
import type { PrintPlugin } from '../types.js';

export const EdgePrintPlugin: PrintPlugin<EdgeASTNode> = {
  match(ast) {
    return ast.type === 'Edge';
  },
  *print(context, ast) {
    yield* context.join(ast.targets, context.directed ? ' -> ' : ' -- ');
    if (ast.children.length === 0) {
      yield ';';
    } else {
      yield ' [';
      yield* context.printChildren(ast.children);
      yield '];';
    }
  },
};
