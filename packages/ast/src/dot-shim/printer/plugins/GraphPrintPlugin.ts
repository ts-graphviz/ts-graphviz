import type { GraphASTNode } from '../../../types.js';
import type { PrintPlugin } from '../types.js';

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
    // A graph created without an id does not own the field.
    if (Object.hasOwn(ast, 'id') && ast.id) {
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
