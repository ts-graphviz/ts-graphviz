import { GraphASTNode } from '../../../types.js';
import { PrintPlugin } from '../types.js';

export const GraphPrintPlugin: PrintPlugin<GraphASTNode> = {
  match(ast) {
    return ast.type === 'Graph';
  },
  *print(context, ast) {
    context.directed = ast.directed;

    if (ast.strict) {
      yield 'strict ';
    }
    yield ast.directed ? 'digraph ' : 'graph ';
    if (ast.id) {
      yield* context.print(ast.id);
      yield ' ';
    }
    yield '{';
    if (ast.children.length >= 1) {
      yield* context.printChildren(ast.children);
    }
    yield '}';
  },
};
