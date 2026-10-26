import { ownField } from '../../../own-field.js';
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
    if (ownField(ast, 'danglingComments')?.length) {
      yield* context.printComments(ownField(ast, 'danglingComments'), 'inline');
    }
    const id = ownField(ast, 'id');
    if (id) {
      yield* context.print(id);
      yield ' ';
    }
    yield '{';
    if (ast.children.length >= 1) {
      yield* context.printChildren(ast.children);
    }
    yield '}';
  },
};
